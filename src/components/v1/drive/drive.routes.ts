import { Router } from 'express';

import {
  cannotBeCustomerMiddleware,
  requireAuthMiddleware,
  validateTokenMiddleware,
} from '../auth/authMiddlwares';

import {
  createNewFolder,
  deleteFile,
  deleteFolder,
  getDriveFoldersAndFiles,
  renameFile,
  renameFolder,
  restoreFile,
  trashFile,
  trashFolder,
} from './drive.actions';

const router = Router();
router.use(
  validateTokenMiddleware,
  requireAuthMiddleware,
  cannotBeCustomerMiddleware
);

router.get('/', getDriveFoldersAndFiles);
router.get('/:folderId', getDriveFoldersAndFiles);

router.post('/folders', createNewFolder);
router.post('/folders/:folderId', createNewFolder);
router.patch('/folders/:folderId', renameFolder);
router.delete('/folders/:folderId/trash', trashFolder);
router.patch('/folders/:folderId/restore', trashFolder);
router.delete('/folders/:folderId', deleteFolder);

router.patch('/files/:fileId', renameFile);
router.delete('/files/:fileId/trash', trashFile);
router.patch('/files/:fileId/restore', restoreFile);
router.delete('/files/:fileId', deleteFile);

export default router;
