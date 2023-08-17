import { z } from 'zod';

import { langSchema } from '../../../types/global';
import { checkLang } from '../../../utils/helpers';

export const addCategorySchema = z
  .object({
    name: z.object(langSchema),
    isEnabled: z.boolean(),
    isPromoted: z.boolean().optional(),
    isMain: z.boolean().optional(),
    iconUrl: z.string().url(),
    iconName: z.string(),
    isBirthday: z.boolean().optional(),
    marketplaces: z.array(
      z.string().length(2, {
        message: 'max-length should be two for each marketplace.',
      })
    ),
  })
  .refine(({ iconUrl, iconName }) => {
    if (iconUrl && !iconName) return false;
    if (!iconUrl && iconName) return false;

    return true;
  })
  .refine(
    ({ name }) => {
      if (checkLang(name)) return true;
    },
    {
      message: 'Name is missing or language is not supported',
    }
  );

export const updateCategorySchema = z
  .object({
    name: z.object(langSchema).optional(),
    isEnabled: z.boolean().optional(),
    isPromoted: z.boolean().optional(),
    // isSupplierList: z.boolean().optional(),
    isMain: z.boolean().optional(),
    isBirthday: z.boolean().optional(),
    marketplaces: z
      .array(
        z.string().length(2, {
          message: 'max-length should be two for each marketplace.',
        })
      )
      .optional(),
    iconName: z.string().optional(),
    iconUrl: z.string().optional(),
  })
  .refine(({ iconUrl, iconName }) => {
    if (iconUrl && !iconName) return false;
    if (!iconUrl && iconName) return false;

    return true;
  })
  .refine(
    ({ name }) => {
      if (name && !checkLang(name)) return false;

      return true;
    },
    {
      message: 'Name is missing or language is not supported',
    }
  );

export const addInternalCategorySchema = z
  .object({
    name: z.object(langSchema),
  })
  .refine(
    ({ name }) => {
      if (checkLang(name)) return true;
    },
    {
      message: 'Name is missing or language is not supported',
    }
  );
