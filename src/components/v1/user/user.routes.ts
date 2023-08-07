import { Router } from 'express';

import policyMiddleware from '../../../appMiddlewares/policy.middleware';
import {
  hasAnyPermissionMiddleware,
  validateTokenMiddleware,
} from '../auth/authMiddlwares';
import { requireAuthMiddleware } from '../auth/authMiddlwares';

import {
  acceptPlatformInviteSchema,
  createPlatformInviteSchema,
  updateProfileSchema,
  verifyPlatformInviteSchema,
} from './user.policy';
import {
  acceptPlatformInvite,
  createPlatformInvite,
  verifyPlatformInvite,
  getMyProfile,
  changeMyMarketplace,
  updateMyProfile,
  verifyPifId,
} from './userActions';
import { getUser, getUsers } from './userActions/userProfileActions';

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

router.patch(
  '/my-profile',
  validateTokenMiddleware,
  requireAuthMiddleware,
  policyMiddleware(updateProfileSchema),
  updateMyProfile
);

router.get(
  '/',
  validateTokenMiddleware,
  requireAuthMiddleware,
  hasAnyPermissionMiddleware(['user.view']),
  getUsers
);
router.get('/verify/:pifId', verifyPifId);

router.get(
  '/:userId',
  validateTokenMiddleware,
  requireAuthMiddleware,
  hasAnyPermissionMiddleware(['user.view']),
  getUser
);

export default router;
