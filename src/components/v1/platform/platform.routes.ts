import { Router } from 'express';

import policyMiddleware from '../../../appMiddlewares/policy.middleware';
import {
  cannotBeCustomerMiddleware,
  hasAnyPermissionMiddleware,
  mustBePlatformAdminMiddleware,
  requireAuthMiddleware,
  validateTokenMiddleware,
} from '../auth/authMiddlwares';

import { verifyExternalCronMiddleware } from './platform.middlewares';
import {
  addMarketplaceSchema,
  addPlatformSocialSchema,
  updateMarketplaceSchema,
  updatePlatformSocialSchema,
} from './platform.policy';
import {
  addMarketplace,
  addPlatformSocial,
  clearDBonDev,
  getPlatformData,
  updateMarketplace,
  updatePlatformSocial,
} from './platformActions';
import {
  getDashboardData,
  getStatisticsData,
} from './platformActions/dataActions';
import {
  generateKeyHashPair,
  pifBiHourlyTasks,
} from './platformActions/generalActions';

const router = Router();

router.get(
  '/',
  validateTokenMiddleware,
  requireAuthMiddleware,
  cannotBeCustomerMiddleware,
  getPlatformData
);
router.get('/public', getPlatformData);
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

router.get(
  '/gen-key-hash',
  validateTokenMiddleware,
  requireAuthMiddleware,
  mustBePlatformAdminMiddleware,
  generateKeyHashPair
);

router.get(
  '/dashboard-data',
  validateTokenMiddleware,
  requireAuthMiddleware,
  cannotBeCustomerMiddleware,
  getDashboardData
);

router.get(
  '/statistics-data',
  validateTokenMiddleware,
  requireAuthMiddleware,
  cannotBeCustomerMiddleware,
  getStatisticsData
);

router.get('/pbht', verifyExternalCronMiddleware, pifBiHourlyTasks);

router.get('/refresh', clearDBonDev);

export default router;
