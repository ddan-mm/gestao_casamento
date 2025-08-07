import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { GuestService } from '../services/guest.service';

const router = Router();
const guestService = new GuestService();

router.post('/', authMiddleware, async (req, res) => {
  const { names, title } = req.body;

  if (!Array.isArray(names) || names.length === 0) {
    return res.status(400).json({ error: 'Names must be a non-empty array' });
  }

  try {
    const guest = await guestService.createGuest({ names, title });
    return res.status(201).json(guest);
  } catch (err: any) {
    console.error('Erro ao criar convidado:', err);
    return res
      .status(500)
      .json({ error: 'Erro ao criar convidado', message: err.message });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  if (data.names && (!Array.isArray(data.names) || data.names.length === 0)) {
    return res.status(400).json({ error: 'Names must be a non-empty array' });
  }

  try {
    const updatedGuest = await guestService.updateGuest(id, data);
    return res.json(updatedGuest);
  } catch (err: any) {
    if (err.message === 'Convidado não encontrado') {
      return res.status(404).json({ error: err.message });
    }
    console.error(err);
    return res
      .status(500)
      .json({ error: 'Erro ao atualizar convidado', message: err.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await guestService.deleteGuest(id);
    return res.json(result);
  } catch (err: any) {
    if (err.message === 'Convidado não encontrado') {
      return res.status(404).json({ error: err.message });
    }
    console.error(err);
    return res
      .status(500)
      .json({ error: 'Erro ao remover convidado', message: err.message });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const guests = await guestService.listGuests();
    return res.json(guests);
  } catch (err: any) {
    console.error(err);
    return res
      .status(500)
      .json({ error: 'Erro ao listar convidados', message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const guest = await guestService.findGuestById(id);
    return res.json(guest);
  } catch (err: any) {
    if (err.message === 'Convidado não encontrado') {
      return res.status(404).json({ error: err.message });
    }
    console.error(err);
    return res
      .status(500)
      .json({ error: 'Erro ao buscar convidado', message: err.message });
  }
});

router.post('/respond/:id', async (req, res) => {
  const { id } = req.params;
  const { confirmed } = req.body;

  if (typeof confirmed !== 'number') {
    return res
      .status(400)
      .json({ message: 'Campo "confirmed" deve ser um número' });
  }

  try {
    const result = await guestService.respondToInvite({ id, confirmed });
    return res.json(result);
  } catch (err: any) {
    if (err.message === 'Convite não encontrado') {
      return res.status(404).json({ message: err.message });
    }
    if (err.message === 'Status de confirmação inválido') {
      return res.status(400).json({ message: err.message });
    }
    if (err.message === 'Convite já foi respondido anteriormente') {
      return res.status(400).json({ message: err.message });
    }

    console.error(err);
    return res
      .status(500)
      .json({ error: 'Erro ao responder convite', message: err.message });
  }
});

router.post('/confirm-present/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await guestService.confirmPresentAtEvent(id);
    return res.json({
      message: 'QR Code válido. Presença confirmada com sucesso',
    });
  } catch (err: any) {
    if (err.message === 'QR Code inválido. Convite não encontrado') {
      return res.status(404).json({ error: err.message });
    }

    if (
      err.message === 'QR Code inválido. Presença já confirmada anteriormente'
    ) {
      return res.status(400).json({ error: err.message });
    }

    if (
      err.message === 'QR Code inválido. Convite não confirmado para o evento'
    ) {
      return res.status(400).json({ error: err.message });
    }

    console.error(err);
    return res
      .status(500)
      .json({
        error: 'Erro ao confirmar presença. Tente novamente',
        message: err.message,
      });
  }
});

export default router;
