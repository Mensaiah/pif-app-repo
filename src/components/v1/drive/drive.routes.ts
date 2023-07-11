import { Router } from 'express';

import policyMiddleware from '../../../appMiddlewares/policy.middleware';
import {
  cannotBeCustomerMiddleware,
  requireAuthMiddleware,
  validateTokenMiddleware,
} from '../auth/authMiddlwares';

import {
  createNewFolder,
  deleteFile,
  deleteFolder,
  getDriveFileByFullpath,
  getDriveFolderByFullpath,
  getDriveFoldersAndFiles,
  renameFile,
  renameFolder,
  restoreFile,
  restoreFolder,
  trashFile,
  trashFolder,
} from './drive.actions';
import {
  createNewFolderSchema,
  getFullPathSchema,
  renameFolderSchema,
} from './drive.policy';

const router = Router();

router.use(
  validateTokenMiddleware,
  requireAuthMiddleware,
  cannotBeCustomerMiddleware
);

router.get('/', getDriveFoldersAndFiles);
router.get(
  '/folderpath',
  policyMiddleware(getFullPathSchema, 'query'),
  getDriveFolderByFullpath
);
router.get(
  '/filepath',
  policyMiddleware(getFullPathSchema, 'query'),
  getDriveFileByFullpath
);
router.get('/:folderId', getDriveFoldersAndFiles);

router.post(
  '/folders',
  policyMiddleware(createNewFolderSchema),
  createNewFolder
);
router.post(
  '/folders/:folderId',
  policyMiddleware(createNewFolderSchema),
  createNewFolder
);
router.patch(
  '/folders/:folderId',
  policyMiddleware(renameFolderSchema),
  renameFolder
);

router.delete('/folders/:folderId/trash', trashFolder);
router.patch('/folders/:folderId/restore', restoreFolder);
router.delete('/folders/:folderId', deleteFolder);

router.patch('/files/:fileId', renameFile);
router.delete('/files/:fileId/trash', trashFile);
router.patch('/files/:fileId/restore', restoreFile);
router.delete('/files/:fileId', deleteFile);

export default router;
