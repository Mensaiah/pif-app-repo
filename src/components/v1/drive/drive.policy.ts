import { Types } from 'mongoose';
import { z } from 'zod';

const pathFieldRegex = /^[\w\/.\- ]*$/gi;

const nameFieldRegex = /^[\w\. ]+$/gi;

// const ObjectIdSchema = z
//   .string()
//   .refine((value) => Types.ObjectId.isValid(value), {
//     message: 'Must be a valid ObjectId',
//   });

const AccessLevelSchema = z.enum([
  'everyone',
  'platform-admin',
  'partner-admin',
]);

const CanBeAccessedBySchema = z.array(AccessLevelSchema).optional();

export const createNewFolderSchema = z.object({
  name: z.string().regex(nameFieldRegex),
  parentFolderId: z.string().optional(),
  canBeAccessedBy: CanBeAccessedBySchema,
});

export const createNewFileSchema = z.object({
  name: z
    .string()
    .regex(nameFieldRegex)
    .refine((name) => name.includes('.'), {
      message: 'Name must include a filename and extension e.g file.txt',
    }),
  parentFolderId: z.string().optional(),
  canBeAccessedBy: CanBeAccessedBySchema,
});

export const newFileMetadataSchema = z.object({
  name: z.string(),
  canBeAccessedBy: z.string().optional(),
});

export const renameFolderSchema = z.object({
  name: z.string().regex(nameFieldRegex),
});

export const getFullPathSchema = z.object({
  path: z.string().regex(pathFieldRegex),
});
