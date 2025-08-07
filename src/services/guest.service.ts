import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { AppDataSource } from '../database/data-source';
import { GuestStatus, GuestEntity, GuestType } from '../entities/guest';
import QRCode from 'qrcode';

interface CreateGuestDTO {
  names: string[];
  title: string;
}

interface RespondToInviteDTO {
  id: string;
  confirmed: GuestStatus;
}

export class GuestService {
  private guestRepo = AppDataSource.getRepository(GuestEntity);

  async createGuest(data: CreateGuestDTO) {
    const { names, title } = data;

    const guest = this.guestRepo.create({
      title,
      type: names.length > 1 ? GuestType.FAMILY : GuestType.INDIVIDUAL,
      names,
      quantity: names.length,
      status: GuestStatus.PENDING,
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
      ...(data.names && {
        type: data.names.length > 1 ? GuestType.FAMILY : GuestType.INDIVIDUAL,
      }),
      ...(data.names && { names: data.names }),
      ...(data.names && { quantity: data.names.length }),
      ...(data.status && { status: data.status }),
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

  async findGuestById(id: string) {
    const guest = await this.guestRepo.findOneBy({ id });

    if (!guest) {
      throw new Error('Convidado não encontrado');
    }

    if (guest?.status === GuestStatus.CONFIRMED) {
      const payload = {
        id: guest.id,
        title: guest.title,
        names: guest.names,
        quantity: guest.quantity,
        status: guest.status,
      };

      const qrCode = await QRCode.toDataURL(JSON.stringify(payload));
      return { ...guest, qrCode };
    }

    return guest;
  }

  async respondToInvite({ id, confirmed }: RespondToInviteDTO) {
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

    const payload = {
      id: guest.id,
      title: guest.title,
      names: guest.names,
      quantity: guest.quantity,
      status: confirmed,
    };

    const qrCode = await QRCode.toDataURL(JSON.stringify(payload));

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
