import path from 'path';

import DOMPurify from 'dompurify';
import { Response } from 'express';
import { JSDOM } from 'jsdom';

import {
  uploadFileToSpace,
  uploadToSpace,
} from '../../../services/s3UploadService';
import { IRequest } from '../../../types/global';
import { _omit, handleResponse, uuid } from '../../../utils/helpers';
import { useWord } from '../../../utils/wordSheet';
import { CategoryIconModel } from '../category/category.model';
import { DriveFileModel, DriveFolderModel } from '../drive/drive.model';
import { UserModel } from '../user/user.model';

export const uploadUserAvatar =
  (self = false) =>
  async (req: IRequest, res: Response) => {
    const userId = self ? req.user._id : req.params.userId;
    const fileExt = path.extname(req.file.originalname);

    try {
      const data = await uploadToSpace({
        Key: `user-avatars/${userId}/${uuid()}${fileExt}`,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      });

      if (self) {
        req.user.avatar = data;
        await req.user.save();
      } else {
        await UserModel.findOneAndUpdate(
          { _id: userId },
          { avatar: data },
          { new: true }
        );
      }

      handleResponse(res, {
        message: 'image uploaded successfully',
        data,
      });
    } catch (err) {
      handleResponse(res, useWord('internalServerError', req.lang), 500, err);
    }
  };

export const uploadContractDocuments = async (req: IRequest, res: Response) => {
  const partnerId = req.params.partnerId;
  const fileExt = path.extname(req.file.originalname);

  try {
    const data = await uploadToSpace({
      Key: `contract-documents/${partnerId}/${uuid()}${fileExt}`,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    });
    handleResponse(res, {
      message: 'document uploaded successfully',
      data,
    });
  } catch (err) {
    handleResponse(res, useWord('internalServerError', req.lang), 500, err);
  }
};

export const uploadProductImages = async (req: IRequest, res: Response) => {
  const { marketplace, partnerId } = req.params;

  try {
    const files: Express.Multer.File[] = req.files as Express.Multer.File[];

    if (files.length > 4) return handleResponse(res, 'max 4 images', 400);

    const data = await files.reduce<Promise<string[]>>(
      async (acc, { buffer, originalname, mimetype }) => {
        const fileExt = path.extname(originalname);
        const data = await uploadToSpace({
          Key: `product-images/${marketplace}/${partnerId}/${uuid()}${fileExt}`,
          Body: buffer,
          ContentType: mimetype,
        });

        return (await acc).concat(data);
      },
      Promise.resolve([])
    );

    handleResponse(res, {
      message: 'product image(s) uploaded successfully',
      data,
    });
  } catch (err) {
    handleResponse(res, useWord('internalServerError', req.lang), 500, err);
  }
};

export const uploadIcon = async (req: IRequest, res: Response) => {
  const metadata = req.headers['x-metadata'] as string;

  const metadataObj = metadata
    ? JSON.parse(metadata.slice(1, metadata.length - 1))
    : {};
  const { name } = metadataObj;

  try {
    const fileExt = path.extname(req.file.originalname);

    let fileBuffer = req.file.buffer;

    // If the file is SVG, sanitize it
    if (req.file.mimetype === 'image/svg+xml') {
      // Setup DOMPurify
      const { window } = new JSDOM('');
      const domPurify = DOMPurify(window);

      // Sanitize the SVG
      const svg = req.file.buffer.toString();
      const sanitizedSVG = domPurify.sanitize(svg);

      // Convert back to buffer
      fileBuffer = Buffer.from(sanitizedSVG);
    }

    const data = await uploadToSpace({
      Key: `category-icons/${req.params.marketplace}/${uuid()}${fileExt}`,
      Body: fileBuffer,
      ContentType: req.file.mimetype,
    });

    const newIcon = await new CategoryIconModel({
      name,
      url: data,
    }).save();

    handleResponse(res, {
      message: 'category-icon uploaded successfully',
      data: _omit(newIcon.toObject(), ['isDisabled']),
    });
  } catch (err) {
    handleResponse(res, useWord('internalServerError', req.lang), 500, err);
  }
};

export const uploadFilesToDrive = async (req: IRequest, res: Response) => {
  try {
    const files: Express.Multer.File[] = req.files as Express.Multer.File[];
    const metadata = req.headers['x-metadata'] as string;

    const metadataObj = metadata
      ? JSON.parse(metadata.slice(1, metadata.length - 1))
      : {};

    if (files.length > 5) return handleResponse(res, 'max 5 images', 400);

    const { canBeAccessedBy, parentId } = metadataObj;

    if (parentId) {
      const folderExists = await DriveFolderModel.findById(parentId, '_id');

      if (!folderExists)
        return handleResponse(res, 'folder does not exist', 404);
    }

    const validAccessOptions = [
      'partner-admins',
      'platform-admins',
      'everyone',
    ];

    // Check if canBeAccessedBy is valid
    if (canBeAccessedBy) {
      const accesses = canBeAccessedBy
        .split(',')
        .map((s: string) => s.trim().toLowerCase());
      if (
        !accesses.every((access: string) => validAccessOptions.includes(access))
      ) {
        return handleResponse(
          res,
          `canBeAccessedBy must contain only these options: ${validAccessOptions.join(
            ', '
          )}`,
          400
        );
      }
    }

    const uploadedFiles = await Promise.all(
      files.map(async ({ originalname, buffer, mimetype }) => {
        const fileExt = path.extname(originalname);
        const { url, size } = await uploadFileToSpace({
          Key: `drive-files/${uuid()}${fileExt}`,
          Body: buffer,
          ContentType: mimetype,
        });

        const newFile = await new DriveFileModel({
          ParentFolder: parentId || null,
          name: originalname,
          mimeType: mimetype,
          extension: fileExt,
          size,
          source: url,
          createdBy: req.user._id,
          updatedBy: req.user._id,
          canBeAccessedBy: canBeAccessedBy
            ? canBeAccessedBy.split(', ')
            : null || ['everyone'],
        }).save();

        return _omit(newFile.toObject(), ['deletedAt', 'canBeAccessedBy']);
      })
    );

    handleResponse(res, {
      message: 'files uploaded successfully',
      data: uploadedFiles,
    });
  } catch (err) {
    handleResponse(res, useWord('internalServerError', req.lang), 500, err);
  }
};
