import { Types } from 'mongoose';
import { z } from 'zod';

const ObjectIdSchema = z
  .string()
  .refine((value) => Types.ObjectId.isValid(value), {
    message: 'Must be a valid ObjectId',
  });

const AccessLevelSchema = z.union([
  z.literal('everyone'),
  z.literal('admin'),
  z.literal('partners'),
  ObjectIdSchema,
]);

const CanBeAccessedBySchema = z.array(AccessLevelSchema).optional();

export const createNewFolderSchema = z.object({
  name: z.string(),
  parentFolderId: z.string().optional(),
  canBeAccessedBy: CanBeAccessedBySchema,
});

export const createNewFileSchema = z.object({
  name: z.string().refine((name) => name.includes('.'), {
    message: 'Name must include a filename and extension e.g file.txt',
  }),
  parentFolderId: z.string().optional(),
  canBeAccessedBy: CanBeAccessedBySchema,
});

export const newFileMetadataSchema = z.object({
  name: z.string(),
  canBeAccessedBy: z.string().optional(),
});
