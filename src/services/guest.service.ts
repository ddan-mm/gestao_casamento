import { AppDataSource } from '../database/data-source';
import { GuestEntity, GuestType } from '../entities/guest';
import QRCode from 'qrcode';

interface CreateGuestDTO {
  type: GuestType;
  names: string[];
  title: string;
}

interface RespondToInviteDTO {
  uuid: string;
  confirmed: boolean;
}

export class GuestService {
  private guestRepo = AppDataSource.getRepository(GuestEntity);

  async createGuest(data: CreateGuestDTO) {
    const { type, names, title } = data;

    const guest = this.guestRepo.create({
      title,
      type,
      names,
      quantity: names.length,
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

  async findGuestById(id: string) {
    return this.guestRepo.findOneBy({ id });
  }

  async respondToInvite({ uuid, confirmed }: RespondToInviteDTO) {
    const guest = await this.guestRepo.findOneBy({ id: uuid });

    if (!guest) {
      throw new Error('Convite não encontrado');
    }

    guest.confirmed = confirmed;
    await this.guestRepo.save(guest);

    if (!confirmed) return { message: 'Convite recusado com sucesso' };

    const payload = {
      id: guest.id,
      title: guest.title,
      names: guest.names,
      quantity: guest.quantity,
    };

    const qrCode = await QRCode.toDataURL(JSON.stringify(payload));

    return {
      message: 'Convite confirmado com sucesso',
      qrCode,
    };
  }
}
