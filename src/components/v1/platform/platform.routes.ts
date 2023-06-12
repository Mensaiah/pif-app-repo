import { Router } from 'express';

import policyMiddleware from '../../../appMiddlewares/policy.middleware';
import {
  hasAnyPermissionMiddleware,
  requireAuthMiddleware,
  validateTokenMiddleware,
} from '../auth/authMiddlwares';

import {
  addMarketplace,
  addPlatformSocial,
  clearDBonDev,
  getPlatformData,
  updateMarketplace,
  updatePlatformSocial,
} from './platform.actions';
import {
  addMarketplaceSchema,
  addPlatformSocialSchema,
  updateMarketplaceSchema,
  updatePlatformSocialSchema,
} from './platform.policy';

const router = Router();

router.get('/', getPlatformData);
router.post(
  '/marketplace',
  validateTokenMiddleware,
  requireAuthMiddleware,
  hasAnyPermissionMiddleware(['manage-marketplaces', 'add-marketplace']),
  policyMiddleware(addMarketplaceSchema),
  addMarketplace
);
router.patch(
  '/marketplace',
  validateTokenMiddleware,
  requireAuthMiddleware,
  hasAnyPermissionMiddleware(['manage-marketplaces', 'update-marketplace']),
  policyMiddleware(updateMarketplaceSchema),
  updateMarketplace
);
router.post(
  '/social',
  validateTokenMiddleware,
  requireAuthMiddleware,
  hasAnyPermissionMiddleware(['manage-socials', 'add-social']),
  policyMiddleware(addPlatformSocialSchema),
  addPlatformSocial
);
router.patch(
  '/social',
  validateTokenMiddleware,
  requireAuthMiddleware,
  hasAnyPermissionMiddleware(['manage-socials', 'update-social']),
  policyMiddleware(updatePlatformSocialSchema),
  updatePlatformSocial
);

router.get('/refresh', clearDBonDev);

export default router;
