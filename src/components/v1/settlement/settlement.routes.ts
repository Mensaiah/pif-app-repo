import { Router } from 'express';

import {
  requireAuthMiddleware,
  validateTokenMiddleware,
} from '../auth/authMiddlwares';

import { getSettlements } from './settlement.actions';

const router = Router();

router.get('/', validateTokenMiddleware, requireAuthMiddleware, getSettlements);

export default router;
