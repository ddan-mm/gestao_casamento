import { Router } from 'express';

import jwt from 'jsonwebtoken';

import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Dados fixos do admin
const ADMIN_EMAIL = 'admin@casamento.com';
const ADMIN_PASSWORD = 'senha123';

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET!, {
    expiresIn: '12h',
  });

  return res.json({ token });
});

export default router;
