import { Router } from 'express';
import multer from 'multer';

import {
  hasAnyPermissionMiddleware,
  requireAuthMiddleware,
  validateTokenMiddleware,
} from '../auth/authMiddlwares';

import {
  uploadContractDocuments,
  uploadIcon,
  uploadProductImages,
  uploadUserAvatar,
} from './upload.actions';

const router = Router();

const upload = multer();

router.post(
  '/user-avatars',
  validateTokenMiddleware,
  requireAuthMiddleware,
  upload.single('user-avatar'),
  uploadUserAvatar
);
router.post(
  '/user-avatars/:userId',
  validateTokenMiddleware,
  requireAuthMiddleware,
  hasAnyPermissionMiddleware(['manage-user-data']),
  upload.single('user-avatar'),
  uploadUserAvatar
);

router.post(
  '/doc/:partnerId',
  validateTokenMiddleware,
  requireAuthMiddleware,
  // TODO: check permissions
  upload.single('doc'),
  uploadContractDocuments
);

router.post(
  '/product-images/:marketplace/:partnerId',
  validateTokenMiddleware,
  requireAuthMiddleware,
  // TODO: check permissions
  upload.array('images'),
  uploadProductImages
);

router.post(
  '/icons/:marketplace',
  validateTokenMiddleware,
  requireAuthMiddleware,
  // TODO: check permissions
  upload.single('icon'),
  uploadIcon
);

export default router;
