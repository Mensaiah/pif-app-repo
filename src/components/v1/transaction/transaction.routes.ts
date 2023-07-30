import { Router } from 'express';

import policyMiddleware from '../../../appMiddlewares/policy.middleware';
import {
  requireAuthMiddleware,
  validateTokenMiddleware,
} from '../auth/authMiddlwares';

import { initiateOrderSchema } from './transaction.policy';
import initiateOrder from './transactionActions/initiateOrder';
import paymentCallbackHandler from './transactionActions/paymentCallback';
import paymentWebhookHandler from './transactionActions/paymentWebhook';

const router = Router();

router.post(
  '/initiate',
  policyMiddleware(initiateOrderSchema),
  validateTokenMiddleware,
  requireAuthMiddleware,
  initiateOrder
);

router.get('/payment-callback/:driver', paymentCallbackHandler);
router.get('/payment-webhook/:driver', paymentWebhookHandler);

export default router;
