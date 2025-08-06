import { Router } from 'express';
import guestRoutes from './guest.controller';
import adminRoutes from './admin.controller';

const router = Router();

router.use('/guests', guestRoutes);
router.use('/admin', adminRoutes);

export default router;
