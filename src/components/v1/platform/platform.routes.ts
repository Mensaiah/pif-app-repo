import { Router } from 'express';

import policyMiddleware from '../../../appMiddlewares/policy.middleware';
import {
  requireAuthMiddleware,
  validateTokenMiddleware,
} from '../auth/authMiddlwares';

import {
  addMarketplace,
  addPlatformSocial,
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
  policyMiddleware(addMarketplaceSchema),
  addMarketplace
);
router.patch(
  '/marketplace',
  validateTokenMiddleware,
  requireAuthMiddleware,
  policyMiddleware(updateMarketplaceSchema),
  updateMarketplace
);
router.post(
  '/social',
  validateTokenMiddleware,
  requireAuthMiddleware,
  policyMiddleware(addPlatformSocialSchema),
  addPlatformSocial
);
router.patch(
  '/social',
  validateTokenMiddleware,
  requireAuthMiddleware,
  policyMiddleware(updatePlatformSocialSchema),
  updatePlatformSocial
);

export default router;
