import { Router } from 'express';

import policyMiddleware from '../../../appMiddlewares/policy.middleware';
import {
  cannotBeCustomerMiddleware,
  hasAnyPermissionMiddleware,
  validateTokenMiddleware,
} from '../auth/authMiddlwares';
import requireAuth from '../auth/authMiddlwares/requireAuth';

import {
  addCategory,
  addInternalCategory,
  disableUploadedCategoryIcon,
  editCategory,
  editInternalCategory,
  enableUploadedCategoryIcon,
  getCategories,
  getCategoryByMarketplace,
  getInternalCategories,
  getUploadedCategoryIcons,
  removeCategory,
  removeInternalCategory,
  removeUploadedCategoryIcon,
} from './category.actions';
import {
  addCategorySchema,
  addInternalCategorySchema,
  updateCategorySchema,
} from './category.policy';

const router = Router();

router.get(
  '/category-icons',
  validateTokenMiddleware,
  requireAuth,
  cannotBeCustomerMiddleware,
  hasAnyPermissionMiddleware(['category-icons.view']),
  getUploadedCategoryIcons
);

router.patch(
  '/category-icons/:categoryIconId/enable',
  validateTokenMiddleware,
  requireAuth,
  hasAnyPermissionMiddleware(['category-icons.edit']),
  enableUploadedCategoryIcon
);

router.patch(
  '/category-icons/:categoryIconId/disable',
  validateTokenMiddleware,
  requireAuth,
  hasAnyPermissionMiddleware(['category-icons.edit']),
  disableUploadedCategoryIcon
);

router.delete(
  '/category-icons/:categoryIconId',
  validateTokenMiddleware,
  requireAuth,
  hasAnyPermissionMiddleware(['category-icons.delete']),
  removeUploadedCategoryIcon
);

router.get(
  '/internal',
  validateTokenMiddleware,
  requireAuth,
  cannotBeCustomerMiddleware,
  hasAnyPermissionMiddleware(['internal-category.view']),
  getInternalCategories
);

router.post(
  '/internal',
  validateTokenMiddleware,
  requireAuth,
  policyMiddleware(addInternalCategorySchema),
  hasAnyPermissionMiddleware(['internal-category.add']),
  addInternalCategory
);

router.patch(
  '/internal/:internalCategoryId',
  validateTokenMiddleware,
  requireAuth,
  hasAnyPermissionMiddleware(['internal-category.edit']),
  policyMiddleware(addInternalCategorySchema),
  editInternalCategory
);

router.delete(
  '/internal/:internalCategoryId',
  validateTokenMiddleware,
  requireAuth,
  hasAnyPermissionMiddleware(['internal-category.delete']),
  removeInternalCategory
);

router.get('/marketplaces/:marketplace', getCategoryByMarketplace);

router.post(
  '/',
  validateTokenMiddleware,
  requireAuth,
  policyMiddleware(addCategorySchema),
  hasAnyPermissionMiddleware(['category.add']),
  addCategory
);

router.patch(
  '/:categoryId',
  validateTokenMiddleware,
  requireAuth,
  policyMiddleware(updateCategorySchema),
  hasAnyPermissionMiddleware(['category.edit']),
  editCategory
);

router.delete(
  '/:categoryId',
  validateTokenMiddleware,
  requireAuth,
  hasAnyPermissionMiddleware(['category.delete']),
  removeCategory
);

router.get(
  '/',
  validateTokenMiddleware,
  requireAuth,
  cannotBeCustomerMiddleware,
  hasAnyPermissionMiddleware(['category.view']),
  getCategories
);

export default router;
