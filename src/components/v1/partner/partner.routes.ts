import { Router } from 'express';

import policyMiddleware from '../../../appMiddlewares/policy.middleware';
import {
  hasAnyPermissionMiddleware,
  validateTokenMiddleware,
} from '../auth/authMiddlwares';
import requireAuth from '../auth/authMiddlwares/requireAuth';

import { addPartner, getPartners, updatePartner } from './partner.actions';
import { addPartnerSchema, updatePartnerSchema } from './partner.policy';

const router = Router();

router.get('/', getPartners);
router.get('/:marketplace', getPartners);
router.post(
  '/',
  validateTokenMiddleware,
  requireAuth,
  hasAnyPermissionMiddleware(['supreme']),
  policyMiddleware(addPartnerSchema),
  addPartner
);
router.patch(
  '/:partnerId',
  validateTokenMiddleware,
  requireAuth,
  hasAnyPermissionMiddleware(['supreme']),
  policyMiddleware(updatePartnerSchema),
  updatePartner
);
export default router;
