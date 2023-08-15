import { Router } from 'express';

import policyMiddleware from '../../../appMiddlewares/policy.middleware';
import {
  cannotBeCustomerMiddleware,
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
import getUserInvites from './userActions/getUserInvites';
import { updateOneSignalPlayerId } from './userActions/oneSignalActions';
import { getUser, getUsers } from './userActions/userProfileActions';

const router = Router();

router.post(
  '/invite',
  policyMiddleware(createPlatformInviteSchema),
  validateTokenMiddleware,
  requireAuthMiddleware,
  createPlatformInvite
);

router.post(
  '/one-signal-player-id',
  validateTokenMiddleware,
  requireAuthMiddleware,
  updateOneSignalPlayerId
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
  '/user-invites',
  validateTokenMiddleware,
  requireAuthMiddleware,
  cannotBeCustomerMiddleware,
  getUserInvites
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

router.get('/verify/:pifId', verifyPifId);

router.get(
  '/:userId',
  validateTokenMiddleware,
  requireAuthMiddleware,
  hasAnyPermissionMiddleware(['user.view']),
  getUser
);

router.get(
  '/',
  validateTokenMiddleware,
  requireAuthMiddleware,
  // hasAnyPermissionMiddleware(['user.view']),
  getUsers
);

export default router;
