import { Router } from 'express';

import policyMiddleware from '../../../appMiddlewares/policy.middleware';
import {
  mustBePlatformAdminMiddleware,
  requireAuthMiddleware,
  validateTokenMiddleware,
} from '../auth/authMiddlwares';

import { generatePayoutSchema } from './payout.policy';
import { getPayouts } from './payoutActions';
import { generatePayout } from './payoutActions/generatePayout';

const router = Router();

router.post(
  '/',
  validateTokenMiddleware,
  requireAuthMiddleware,
  mustBePlatformAdminMiddleware,
  policyMiddleware(generatePayoutSchema),
  generatePayout
);

router.get(
  '/',
  validateTokenMiddleware,
  requireAuthMiddleware,
  mustBePlatformAdminMiddleware,
  getPayouts
);

export default router;
