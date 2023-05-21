import path from 'path';

import { Response } from 'express';
import mime from 'mime';
import { z } from 'zod';

import { IRequest } from '../../../types/global';
import { handleResponse } from '../../../utils/helpers';

import { DriveFileModel, DriveFolderModel } from './drive.model';
import { createNewFileSchema, createNewFolderSchema } from './drive.policy';

// TODO: check if parentFolder exists and is not deleted
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

export const createNewFile = async (req: IRequest, res: Response) => {
  type bodyData = z.infer<typeof createNewFileSchema>;

  const { name, parentFolderId, canBeAccessedBy }: bodyData = req.body;
  const { base: fileName, ext: fileExtension } = path.parse(name);
  const mimeType = mime.getType(fileExtension);

  const currentUser = req.decoded.ref;

  try {
    const newFile = await new DriveFileModel({
      ParentFolder: parentFolderId || null,
      name: fileName,
      extension: fileExtension,
      mimeType,
      // TODO: add size
      // TODO: add source
      createdBy: currentUser,
      updatedBy: currentUser,
      canBeAccessedBy: canBeAccessedBy || ['everyone'],
    }).save();
  } catch (err) {}
};
