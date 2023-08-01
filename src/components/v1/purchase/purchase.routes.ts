import { Router } from 'express';

import {
  requireAuthMiddleware,
  validateTokenMiddleware,
} from '../auth/authMiddlwares';

import { getPurchases } from './purchase.action';

const router = Router();

router.get('/', validateTokenMiddleware, requireAuthMiddleware, getPurchases);

export default router;
