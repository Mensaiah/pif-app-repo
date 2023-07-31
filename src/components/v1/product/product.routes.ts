import { Router } from 'express';

import policyMiddleware from '../../../appMiddlewares/policy.middleware';
import {
  cannotBeCustomerMiddleware,
  hasAnyPermissionMiddleware,
  mustBePlatformAdminMiddleware,
  validateTokenMiddleware,
} from '../auth/authMiddlwares';
import requireAuth from '../auth/authMiddlwares/requireAuth';

import {
  addProduct,
  generateRedeemCodes,
  addProductSplitPrice,
  approveProduct,
  disapproveProduct,
  getOtherProducts,
  getProductRedeemCodes,
  getProducts,
  getProductsByCategoryAndPartner,
  getSingleProduct,
  removeProduct,
  removeProductSplitPrice,
  setProductActive,
  setProductInactive,
  updateProduct,
  updateProductSplitPrice,
} from './product.actions';
import {
  addProductSchema,
  addProductSplitPriceSchema,
  addRedeemCodeSchema,
  updateProductSchema,
  updateProductSplitPriceSchema,
} from './product.policy';

const router = Router();

router.get(
  '/marketplace/:marketplace/category/:categoryId/products/:productId/others',
  getOtherProducts
);

router.get(
  '/marketplace/:marketplace/category/:categoryId/partner/:partnerId',
  getProductsByCategoryAndPartner
);

router.get(
  '/marketplace/:marketplace',
  validateTokenMiddleware,
  requireAuth,
  hasAnyPermissionMiddleware(['product.view']),
  getProducts
);

router.patch(
  '/:productId/split-price/:code',
  validateTokenMiddleware,
  requireAuth,
  policyMiddleware(updateProductSplitPriceSchema),
  hasAnyPermissionMiddleware(['product.edit']),
  updateProductSplitPrice
);

router.delete(
  '/:productId/split-price/:code',
  validateTokenMiddleware,
  requireAuth,
  hasAnyPermissionMiddleware(['product.edit']),
  removeProductSplitPrice
);

router.post(
  '/:productId/redeem-codes/generate',
  validateTokenMiddleware,
  requireAuth,
  policyMiddleware(addRedeemCodeSchema),
  hasAnyPermissionMiddleware(['product.add']),
  generateRedeemCodes
);

router.get(
  '/:productId/redeem-codes',
  validateTokenMiddleware,
  requireAuth,
  hasAnyPermissionMiddleware(['product.view']),
  getProductRedeemCodes
);

router.get('/:productId/public', getSingleProduct);

router.post(
  '/:productId/split-price',
  validateTokenMiddleware,
  requireAuth,
  policyMiddleware(addProductSplitPriceSchema),
  hasAnyPermissionMiddleware(['product.add']),
  addProductSplitPrice
);

router.patch(
  '/:productId/set-active',
  validateTokenMiddleware,
  requireAuth,
  hasAnyPermissionMiddleware(['product.edit']),
  setProductActive
);

router.patch(
  '/:productId/set-inactive',
  validateTokenMiddleware,
  requireAuth,
  hasAnyPermissionMiddleware(['product.edit']),
  setProductInactive
);

router.patch(
  '/:productId/approve',
  validateTokenMiddleware,
  requireAuth,
  mustBePlatformAdminMiddleware,
  hasAnyPermissionMiddleware(['product.edit']),
  approveProduct
);

router.patch(
  '/:productId/disapprove',
  validateTokenMiddleware,
  requireAuth,
  mustBePlatformAdminMiddleware,
  hasAnyPermissionMiddleware(['product.edit']),
  disapproveProduct
);

router.get(
  '/:productId',
  validateTokenMiddleware,
  requireAuth,
  hasAnyPermissionMiddleware(['product.view']),
  getSingleProduct
);

router.patch(
  '/:productId',
  validateTokenMiddleware,
  requireAuth,
  policyMiddleware(updateProductSchema),
  hasAnyPermissionMiddleware(['product.edit']),
  updateProduct
);

router.delete(
  '/:productId',
  validateTokenMiddleware,
  requireAuth,
  hasAnyPermissionMiddleware(['product.delete']),
  removeProduct
);

router.get(
  '/',
  validateTokenMiddleware,
  requireAuth,
  cannotBeCustomerMiddleware,
  hasAnyPermissionMiddleware(['product.view']),
  getProducts
);

router.post(
  '/',
  validateTokenMiddleware,
  requireAuth,
  policyMiddleware(addProductSchema),
  hasAnyPermissionMiddleware(['product.add']),
  addProduct
);

export default router;
