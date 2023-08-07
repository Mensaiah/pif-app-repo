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
  hasAnyPermissionMiddleware(['marketplaces.add']),
  policyMiddleware(addMarketplaceSchema),
  addMarketplace
);
router.patch(
  '/marketplace',
  validateTokenMiddleware,
  requireAuthMiddleware,
  hasAnyPermissionMiddleware(['marketplaces.edit']),
  policyMiddleware(updateMarketplaceSchema),
  updateMarketplace
);
router.post(
  '/social',
  validateTokenMiddleware,
  requireAuthMiddleware,
  hasAnyPermissionMiddleware(['socials.add']),
  policyMiddleware(addPlatformSocialSchema),
  addPlatformSocial
);
router.patch(
  '/social',
  validateTokenMiddleware,
  requireAuthMiddleware,
  hasAnyPermissionMiddleware(['socials.edit']),
  policyMiddleware(updatePlatformSocialSchema),
  updatePlatformSocial
);

router.get('/refresh', clearDBonDev);

export default router;
