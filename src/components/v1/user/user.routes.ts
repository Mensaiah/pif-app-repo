import { Router } from 'express';

import policyMiddleware from '../../../appMiddlewares/policy.middleware';
import { validateTokenMiddleware } from '../auth/authMiddlwares';
import { requireAuthMiddleware } from '../auth/authMiddlwares';

import {
  acceptPlatformInviteSchema,
  createPlatformInviteSchema,
  verifyPlatformInviteSchema,
} from './user.policy';
import {
  acceptPlatformInvite,
  createPlatformInvite,
  verifyPlatformInvite,
  getMyProfile,
  changeMyMarketplace,
} from './userActions';

const router = Router();

router.post(
  '/invite',
  policyMiddleware(createPlatformInviteSchema),
  validateTokenMiddleware,
  requireAuthMiddleware,
  createPlatformInvite
);

router.get(
  '/verify-invite/:code',
  policyMiddleware(verifyPlatformInviteSchema, 'params'),
  verifyPlatformInvite
);

router.post(
  '/accept-invite',
  policyMiddleware(acceptPlatformInviteSchema),
  acceptPlatformInvite
);

// change my marketplace to the one in the params
router.put(
  '/my-marketplace/:marketplace',
  validateTokenMiddleware,
  requireAuthMiddleware,
  changeMyMarketplace
);

router.get(
  '/my-profile',
  validateTokenMiddleware,
  requireAuthMiddleware,
  getMyProfile
);

export default router;
