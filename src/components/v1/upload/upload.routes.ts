import { Router } from 'express';
import multer from 'multer';

import {
  cannotBeCustomerMiddleware,
  hasAnyPermissionMiddleware,
  requireAuthMiddleware,
  validateTokenMiddleware,
} from '../auth/authMiddlwares';

import {
  uploadContractDocuments,
  uploadFilesToDrive,
  uploadIcon,
  uploadProductImages,
  uploadUserAvatar,
} from './upload.actions';

const router = Router();

const upload = multer();

router.post(
  '/my-avatar',
  validateTokenMiddleware,
  requireAuthMiddleware,
  upload.single('avatar'),
  uploadUserAvatar(true)
);

router.post(
  '/user-avatars/:userId',
  validateTokenMiddleware,
  requireAuthMiddleware,
  hasAnyPermissionMiddleware(['manage-users']),
  upload.single('avatar'),
  uploadUserAvatar()
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

router.post(
  '/drive',
  validateTokenMiddleware,
  requireAuthMiddleware,
  cannotBeCustomerMiddleware,
  upload.array('files'),
  uploadFilesToDrive
);

export default router;
