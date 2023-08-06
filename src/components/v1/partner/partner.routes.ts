import { Router } from 'express';

import policyMiddleware from '../../../appMiddlewares/policy.middleware';
import {
  cannotBeCustomerMiddleware,
  hasAnyPermissionMiddleware,
  requireAuthMiddleware,
  validateTokenMiddleware,
} from '../auth/authMiddlwares';
import requireAuth from '../auth/authMiddlwares/requireAuth';

import {
  addPartnerSchema,
  partnerInviteSchema,
  updatePartnerSchema,
} from './partner.policy';
import {
  addPartner,
  addPartnerAdmins,
  createPartnerInvite,
  getAllPartnerAdmins,
  getPartnerRedeemType,
  getPartners,
  getPartnersByCategoryAndMarketplace,
  getSinglePartner,
  removePartnerAdmins,
  updatePartner,
} from './partnerActions';

const router = Router();

router.get(
  '/marketplaces/:marketplace/categories/:categoryId',
  getPartnersByCategoryAndMarketplace
);

router.delete(
  '/:partnerId/admin/:adminId',
  validateTokenMiddleware,
  requireAuth,
  hasAnyPermissionMiddleware(['partner.delete']),
  removePartnerAdmins
);

router.get(
  '/:partnerId/admins',
  validateTokenMiddleware,
  requireAuth,
  getAllPartnerAdmins
);

router.post(
  '/:partnerId/admin',
  validateTokenMiddleware,
  requireAuth,
  hasAnyPermissionMiddleware(['partner.add']),
  policyMiddleware(partnerInviteSchema),
  addPartnerAdmins
);

router.get('/:partnerId', cannotBeCustomerMiddleware, getSinglePartner);

router.patch(
  '/:partnerId',
  validateTokenMiddleware,
  requireAuth,
  hasAnyPermissionMiddleware(['partner.edit']),
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

//since related to product
router.get(
  '/:partnerId/redeem-type',
  validateTokenMiddleware,
  requireAuth,
  hasAnyPermissionMiddleware(['product.view']),
  getPartnerRedeemType
);

router.get(
  '/',
  validateTokenMiddleware,
  requireAuth,
  hasAnyPermissionMiddleware(['partner.view']),
  getPartners
);

router.post(
  '/',
  validateTokenMiddleware,
  requireAuth,
  hasAnyPermissionMiddleware(['supreme']),
  policyMiddleware(addPartnerSchema),
  addPartner
);

export default router;
