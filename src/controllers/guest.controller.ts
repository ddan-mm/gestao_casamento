import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { GuestService } from '../services/guest.service';

const router = Router();
const guestService = new GuestService();

router.post('/', authMiddleware, async (req, res) => {
  const { type, names, title } = req.body;

  if (!Array.isArray(names) || names.length === 0) {
    return res.status(400).json({ error: 'Names must be a non-empty array' });
  }

  try {
    const guest = await guestService.createGuest({ type, names, title });
    return res.status(201).json(guest);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao criar convidado' });
  }
});

router.post('/respond/:uuid', async (req, res) => {
  const { uuid } = req.params;
  const { confirmed } = req.body;

  if (typeof confirmed !== 'boolean') {
    return res
      .status(400)
      .json({ message: 'Campo "confirmed" deve ser booleano' });
  }

  try {
    const result = await guestService.respondToInvite({ uuid, confirmed });
    return res.json(result);
  } catch (err: any) {
    if (err.message === 'Convite não encontrado') {
      return res.status(404).json({ message: err.message });
    }
    console.error(err);
    return res.status(500).json({ message: 'Erro interno no servidor' });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const guests = await guestService.listGuests();
    return res.json(guests);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao listar convidados' });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const guest = await guestService.findGuestById(id);
    if (!guest) {
      return res.status(404).json({ error: 'Convidado não encontrado' });
    }
    return res.json(guest);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao buscar convidado' });
  }
});

export default router;
