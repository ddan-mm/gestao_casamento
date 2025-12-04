import { Router } from 'express';

import jwt from 'jsonwebtoken';
import { logError } from '../mechanisms/logger';

const router = Router();

// Dados fixos do admin
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email !== ADMIN_EMAIL ||
      password !== ADMIN_PASSWORD ||
      !email ||
      !password
    ) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET!, {
      expiresIn: '12h',
    });

    return res.json({ token });
  } catch (err: any) {
    logError(`Erro no login do admin: ${err.message}`);
    return res
      .status(500)
      .json({ error: 'Erro no login do admin', message: err.message });
  }
});

export default router;
