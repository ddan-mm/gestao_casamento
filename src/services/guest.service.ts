import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { AppDataSource } from '../database/data-source';
import { GuestStatus, GuestEntity, GuestType } from '../entities/guest';
import QRCode from 'qrcode';
import crypto from 'crypto';

interface CreateGuestDTO {
  names: string[];
  title: string;
  status?: GuestStatus;
  cellphone?: string;
}

interface RespondToInviteDTO {
  id: string;
  confirmed: GuestStatus;
  inviteBaseUrl: string;
}

export class GuestService {
  private guestRepo = AppDataSource.getRepository(GuestEntity);

  async validateInvite(payloadBase64: string, signature: string) {
    const secret = process.env.QR_SECRET_KEY!;
    const payload = Buffer.from(payloadBase64, 'base64url').toString('utf8');

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    return signature === expectedSignature;
  }

  async createGuest(data: CreateGuestDTO) {
    const { names, title, status, cellphone } = data;

    const guest = this.guestRepo.create({
      title: title || `Família ${names[0]}`,
      type: names.length > 1 ? GuestType.FAMILY : GuestType.INDIVIDUAL,
      names,
      quantity: names.length,
      status: status || GuestStatus.PENDING,
      cellphone,
    });

    await this.guestRepo.save(guest);
    return guest;
  }

  async listGuests() {
    return this.guestRepo.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async updateGuest(id: string, data: QueryDeepPartialEntity<GuestEntity>) {
    const guest = await this.guestRepo.findOneBy({ id });
    if (!guest) {
      throw new Error('Convidado não encontrado');
    }
    Object.assign(guest, data);
    await this.guestRepo.update(guest.id, {
      ...(data.title && { title: data.title }),
      ...(data.names && { names: data.names }),
      ...(data.names && { quantity: data.names.length }),
      ...(data.status && { status: data.status }),
      ...(data.cellphone && { cellphone: data.cellphone }),
      ...(data.names && {
        type: data.names.length > 1 ? GuestType.FAMILY : GuestType.INDIVIDUAL,
      }),
      updatedAt: new Date(),
    });
    return guest;
  }

  async deleteGuest(id: string) {
    const guest = await this.guestRepo.findOneBy({ id });
    if (!guest) {
      throw new Error('Convidado não encontrado');
    }
    await this.guestRepo.remove(guest);
    return { message: 'Convidado removido com sucesso' };
  }

  async findGuestById(id: string, inviteBaseUrl: string) {
    const guest = await this.guestRepo.findOneBy({ id });

    if (!guest) {
      throw new Error('Convidado não encontrado');
    }

    if (guest?.status === GuestStatus.CONFIRMED) {
      const qrCode = await this.generateQRCode(inviteBaseUrl);
      return { ...guest, qrCode };
    }

    return guest;
  }

  private async generateQRCode(inviteBaseUrl: string): Promise<string> {
    const inviteUrl = `${inviteBaseUrl}`;
    const qrCode = await QRCode.toDataURL(inviteUrl);

    return qrCode;
  }

  async respondToInvite({ id, confirmed, inviteBaseUrl }: RespondToInviteDTO) {
    const guest = await this.guestRepo.findOneBy({ id });

    if (!guest) {
      throw new Error('Convite não encontrado');
    }

    if (guest.status !== GuestStatus.PENDING) {
      return { message: 'Convite já foi respondido anteriormente' };
    }

    if (
      confirmed !== GuestStatus.CONFIRMED &&
      confirmed !== GuestStatus.DECLINED
    ) {
      throw new Error('Status de confirmação inválido');
    }

    await this.guestRepo.save({
      ...guest,
      status: confirmed,
    });

    if (confirmed === GuestStatus.DECLINED)
      return { message: 'Convite recusado com sucesso' };

    const qrCode = await this.generateQRCode(inviteBaseUrl);

    return {
      message: 'Convite confirmado com sucesso',
      qrCode,
    };
  }

  async confirmPresentAtEvent(id: string) {
    const guest = await this.guestRepo.findOneBy({ id });

    if (!guest) {
      throw new Error('QR Code inválido. Convite não encontrado');
    }

    if (guest.status === GuestStatus.PRESENT_AT_EVENT) {
      throw new Error('QR Code inválido. Convite já foi utilizado');
    }

    if (guest.status !== GuestStatus.CONFIRMED) {
      throw new Error('QR Code inválido. Convite não confirmado para o evento');
    }

    guest.status = GuestStatus.PRESENT_AT_EVENT;
    await this.guestRepo.save(guest);

    return { message: 'QR Code válido. Presença confirmada com sucesso' };
  }
}
