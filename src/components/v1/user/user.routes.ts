import { Router } from 'express';

import policyMiddleware from '../../../appMiddlewares/policy.middleware';
import { validateTokenMiddleware } from '../auth/authMiddlwares';
import { requireAuthMiddleware } from '../auth/authMiddlwares';

import {
  acceptUserInviteSchema,
  inviteUserSchema,
  verifyInviteSchema,
} from './user.policy';
import {
  doAcceptUserInvite,
  doInviteUser,
  doVerifyUserInvite,
} from './userActions';

const router = Router();

router.post(
  '/invite',
  policyMiddleware(inviteUserSchema),
  validateTokenMiddleware,
  requireAuthMiddleware,
  doInviteUser
);

router.get(
  '/invite/:code',
  policyMiddleware(verifyInviteSchema, 'params'),
  doVerifyUserInvite
);

router.post(
  '/accept-invite',
  policyMiddleware(acceptUserInviteSchema),
  doAcceptUserInvite
);

export default router;
