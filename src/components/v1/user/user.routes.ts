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
} from './userActions';
import getMyProfile from './userActions/getMyProfile';

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

router.get(
  '/my-profile',
  validateTokenMiddleware,
  requireAuthMiddleware,
  getMyProfile
);

export default router;
