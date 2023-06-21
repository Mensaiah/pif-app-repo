import path from 'path';

import DOMPurify from 'dompurify';
import { Response } from 'express';
import { JSDOM } from 'jsdom';

import { uploadToSpace } from '../../../services/s3UploadService';
import { IRequest } from '../../../types/global';
import { handleResponse, uuid } from '../../../utils/helpers';
import { useWord } from '../../../utils/wordSheet';

export const uploadUserAvatar = async (req: IRequest, res: Response) => {
  const userId = req.params.userId || req.user._id;
  const fileExt = path.extname(req.file.originalname);

  try {
    const data = await uploadToSpace({
      Key: `user-avatars/${userId}/${uuid()}${fileExt}`,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    });
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
      async (acc, { buffer, originalname }) => {
        const fileExt = path.extname(originalname);
        const data = await uploadToSpace({
          Key: `product-images/${marketplace}/${partnerId}/${uuid()}${fileExt}`,
          Body: buffer,
          ContentType: req.file.mimetype,
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

export const uploadCategoryIcon = async (req: IRequest, res: Response) => {
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

    handleResponse(res, {
      message: 'category-icon uploaded successfully',
      data,
    });
  } catch (err) {
    handleResponse(res, useWord('internalServerError', req.lang), 500, err);
  }
};
