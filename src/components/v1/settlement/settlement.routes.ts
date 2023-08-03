import { Router } from 'express';

import {
  hasAnyPermissionMiddleware,
  requireAuthMiddleware,
  validateTokenMiddleware,
} from '../auth/authMiddlwares';

import { getSettlements } from './settlement.actions';

const router = Router();

router.get(
  '/',
  validateTokenMiddleware,
  requireAuthMiddleware,
  hasAnyPermissionMiddleware(['settlements.view']),
  getSettlements
);

router.get(
  '/:settlementId',
  validateTokenMiddleware,
  requireAuthMiddleware,
  hasAnyPermissionMiddleware(['settlements.view']),
  getSettlements
);

export default router;
