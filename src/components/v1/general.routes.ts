import { Router } from 'express';

import {
  mustBeCustomerMiddleware,
  requireAuthMiddleware,
  validateTokenMiddleware,
} from './auth/authMiddlwares';
import {
  getReceivedPifs,
  getSentPifs,
  redeemPif,
  unwrapGift,
} from './purchase/userPifActions';

const router = Router();

router.patch(
  '/received-pifs/:purchaseId/unwrap',
  validateTokenMiddleware,
  requireAuthMiddleware,
  mustBeCustomerMiddleware,
  unwrapGift
);

router.patch(
  '/received-pifs/:purchaseId/redeem',
  validateTokenMiddleware,
  requireAuthMiddleware,
  mustBeCustomerMiddleware,
  redeemPif
);

router.get(
  '/sent-pifs/:purchaseId',
  validateTokenMiddleware,
  requireAuthMiddleware,
  mustBeCustomerMiddleware,
  getSentPifs
);

router.get(
  '/received-pifs/:purchaseId',
  validateTokenMiddleware,
  requireAuthMiddleware,
  mustBeCustomerMiddleware,
  getReceivedPifs
);

router.get(
  '/sent-pifs',
  validateTokenMiddleware,
  requireAuthMiddleware,
  mustBeCustomerMiddleware,
  getSentPifs
);

router.get(
  '/received-pifs',
  validateTokenMiddleware,
  requireAuthMiddleware,
  mustBeCustomerMiddleware,
  getReceivedPifs
);

export default router;
