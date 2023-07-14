import { Router } from 'express';

import policyMiddleware from '../../../appMiddlewares/policy.middleware';
import {
  cannotBeCustomerMiddleware,
  hasAnyPermissionMiddleware,
  validateTokenMiddleware,
} from '../auth/authMiddlwares';
import requireAuth from '../auth/authMiddlwares/requireAuth';

import {
  addPartner,
  createPartnerInvite,
  getPartners,
  getPartnersByCategoryAndMarketplace,
  getSinglePartner,
  updatePartner,
} from './partner.actions';
import {
  addPartnerSchema,
  partnerInviteSchema,
  updatePartnerSchema,
} from './partner.policy';

const router = Router();

router.get(
  '/',
  validateTokenMiddleware,
  requireAuth,
  hasAnyPermissionMiddleware(['partner.view']),
  getPartners
);
router.get(
  '/marketplace/:marketplace/category/:categoryId',
  getPartnersByCategoryAndMarketplace
);
router.get('/:partnerId', cannotBeCustomerMiddleware, getSinglePartner);
router.get('/marketplaces/:marketplace', getPartners);
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

router.post(
  '/invite',
  validateTokenMiddleware,
  requireAuth,
  hasAnyPermissionMiddleware(['supreme']),
  policyMiddleware(partnerInviteSchema),
  createPartnerInvite
);
export default router;
