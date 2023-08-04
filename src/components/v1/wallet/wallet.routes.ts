import { Router } from 'express';

import {
  cannotBeCustomerMiddleware,
  requireAuthMiddleware,
  validateTokenMiddleware,
} from '../auth/authMiddlwares';

import { getWallets } from './wallet.actions';

const router = Router();

router.get(
  '/wallets',
  validateTokenMiddleware,
  requireAuthMiddleware,
  cannotBeCustomerMiddleware,
  getWallets
);

export default router;
