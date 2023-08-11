import { Router } from 'express';

import policyMiddleware from '../../appMiddlewares/policy.middleware';

import {
  mustBeCustomerMiddleware,
  requireAuthMiddleware,
  validateTokenMiddleware,
} from './auth/authMiddlwares';
import { passOnPifSchema } from './purchase/purchase.policy';
import {
  getReceivedPifs,
  getSentPifs,
  redeemPif,
  unwrapGift,
} from './purchase/userPifActions';
import { passOnPif } from './purchase/userPifActions/passOnPif';

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

router.patch(
  '/received-pifs/:purchaseId/pass-on',
  validateTokenMiddleware,
  requireAuthMiddleware,
  mustBeCustomerMiddleware,
  policyMiddleware(passOnPifSchema),
  passOnPif
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
