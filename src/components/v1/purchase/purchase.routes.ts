import { Router } from 'express';

import {
  hasAnyPermissionMiddleware,
  requireAuthMiddleware,
  validateTokenMiddleware,
} from '../auth/authMiddlwares';

import { getPurchase, getPurchases } from './purchase.action';

const router = Router();

router.get(
  '/',
  validateTokenMiddleware,
  requireAuthMiddleware,
  hasAnyPermissionMiddleware(['transactions.view']),
  getPurchases
);

router.get(
  '/:purchaseId',
  validateTokenMiddleware,
  requireAuthMiddleware,
  hasAnyPermissionMiddleware(['transactions.view']),
  getPurchase
);

export default router;
