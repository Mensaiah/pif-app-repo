import { Router } from 'express';
import multer from 'multer';

import policyMiddleware from '../../../appMiddlewares/policy.middleware';
import {
  cannotBeCustomerMiddleware,
  hasAnyPermissionMiddleware,
  requireAuthMiddleware,
  validateTokenMiddleware,
} from '../auth/authMiddlwares';

import {
  uploadDirect,
  uploadContractDocuments,
  uploadFilesToDrive,
  uploadIcon,
  uploadProductImages,
  uploadUserAvatar,
} from './upload.actions';
import { uploadDirectSchema } from './upload.policy';

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
  hasAnyPermissionMiddleware(['user.edit']),
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

router.post(
  '/direct',
  validateTokenMiddleware,
  requireAuthMiddleware,
  policyMiddleware(uploadDirectSchema),
  uploadDirect
);

export default router;
