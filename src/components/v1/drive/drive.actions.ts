import { Response } from 'express';
import { z } from 'zod';

import { IRequest } from '../../../types/global';
import { consoleLog, handleResponse } from '../../../utils/helpers';

import { DriveFileModel, DriveFolderModel } from './drive.model';
import { createNewFolderSchema } from './drive.policy';

export const getDriveFoldersAndFiles = async (req: IRequest, res: Response) => {
  try {
    const { folderId } = req.params;

    const folders = await DriveFolderModel.find({
      ParentFolder: folderId || null,
    }).sort({ createdAt: -1 });
    const files = await DriveFileModel.find({
      ParentFolder: folderId || null,
    }).sort({ createdAt: -1 });

    return handleResponse(res, {
      data: [...folders, ...files].sort((a, b) => a.name.localeCompare(b.name)),
    });
  } catch (err) {
    return handleResponse(res, 'internal server error', 500);
  }
};

export const createNewFolder = async (req: IRequest, res: Response) => {
  type bodyType = z.infer<typeof createNewFolderSchema>;

  const { name, parentFolderId, canBeAccessedBy }: bodyType = req.body;
  const currentUser = req.decoded.ref;

  try {
    const newFolder = await new DriveFolderModel({
      ParentFolder: parentFolderId || null,
      name,
      createdBy: currentUser,
      updatedBy: currentUser,
      canBeAccessedBy: canBeAccessedBy || ['everyone'],
    }).save();

    delete newFolder.deletedAt;

    return handleResponse(
      res,
      {
        message: 'Successful!',
        data: newFolder,
      },
      201
    );
  } catch (err) {
    return handleResponse(res, 'internal server error', 500);
  }
};

export const renameFolder = async (req: IRequest, res: Response) => {
  try {
    const { folderId } = req.params;

    const folder = await DriveFolderModel.findById(folderId);

    if (!folder) return handleResponse(res, 'Folder not found', 404);

    const { name } = req.body;

    folder.name = name;
    folder.updatedBy = req.user._id;

    await folder.save();

    return handleResponse(res, {
      message: 'Folder renamed successfully',
    });
  } catch (err) {
    return handleResponse(res, 'internal server error', 500);
  }
};

export const trashFolder = async (req: IRequest, res: Response) => {
  try {
    const { folderId } = req.params;

    const folder = await DriveFolderModel.findById(folderId);

    if (!folder) return handleResponse(res, 'Folder not found', 404);

    folder.deletedAt = new Date();

    await folder.save();

    return handleResponse(res, {
      message: 'Folder trashed successfully',
    });
  } catch (err) {
    return handleResponse(res, 'internal server error', 500);
  }
};

export const restoreFolder = async (req: IRequest, res: Response) => {
  try {
    const { folderId } = req.params;

    const folder = await DriveFolderModel.findById(folderId);

    if (!folder) return handleResponse(res, 'Folder not found', 404);

    folder.deletedAt = null;

    await folder.save();

    return handleResponse(res, {
      message: 'Folder restored successfully',
    });
  } catch (err) {
    return handleResponse(res, 'internal server error', 500);
  }
};

export const deleteFolder = async (req: IRequest, res: Response) => {
  try {
    const { folderId } = req.params;

    const folder = await DriveFolderModel.findOneAndRemove({ _id: folderId });

    consoleLog({ folder });

    if (!folder) return handleResponse(res, 'Folder not found', 404);

    return handleResponse(res, {
      message: 'Folder deleted successfully',
    });
  } catch (err) {
    return handleResponse(res, 'internal server error', 500);
  }
};

export const renameFile = async (req: IRequest, res: Response) => {
  try {
    const { fileId } = req.params;

    const file = await DriveFileModel.findById(fileId);

    if (!file) return handleResponse(res, 'File not found', 404);

    const { name } = req.body;
    // TODO: add validation for name

    file.name = name;
    file.updatedBy = req.user._id;

    await file.save();

    return handleResponse(res, {
      message: 'File renamed successfully',
    });
  } catch (err) {
    return handleResponse(res, 'internal server error', 500);
  }
};

export const trashFile = async (req: IRequest, res: Response) => {
  try {
    const { fileId } = req.params;

    const file = await DriveFileModel.findById(fileId);

    if (!file) return handleResponse(res, 'File not found', 404);

    file.deletedAt = new Date();

    await file.save();

    return handleResponse(res, {
      message: 'File trashed successfully',
    });
  } catch (err) {
    return handleResponse(res, 'internal server error', 500);
  }
};

export const restoreFile = async (req: IRequest, res: Response) => {
  try {
    const { fileId } = req.params;

    const file = await DriveFileModel.findById(fileId);

    if (!file) return handleResponse(res, 'File not found', 404);

    file.deletedAt = null;

    await file.save();

    return handleResponse(res, {
      message: 'File restored successfully',
    });
  } catch (err) {
    return handleResponse(res, 'internal server error', 500);
  }
};

export const deleteFile = async (req: IRequest, res: Response) => {
  try {
    const { fileId } = req.params;

    const file = await DriveFileModel.findOneAndRemove({ _id: fileId });

    if (!file) return handleResponse(res, 'File not found', 404);

    return handleResponse(res, {
      message: 'File deleted successfully',
    });
  } catch (err) {
    return handleResponse(res, 'internal server error', 500);
  }
};
