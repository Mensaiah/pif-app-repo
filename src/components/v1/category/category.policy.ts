import { z } from 'zod';

import { langSchema } from '../../../types/global';
import { checkLang } from '../../../utils/helpers';

export const addCategorySchema = z
  .object({
    name: z.object(langSchema),
    isEnabled: z.boolean(),
    isPromoted: z.boolean().optional(),
    isSupplierList: z.boolean().optional(),
    isMain: z.boolean().optional(),
    isFunctional: z.boolean().optional(),
    type: z.number().optional(),
    iconifyName: z.string().optional(),
    iconSvg: z.string().optional(),
    iconUrl: z.string().optional(),
    isBirthday: z.boolean().optional(),
    marketplaces: z.array(
      z.string().length(2, {
        message: 'max-length should be two for each marketplace.',
      })
    ),
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
    isSupplierList: z.boolean().optional(),
    isMain: z.boolean().optional(),
    isFunctional: z.boolean().optional(),
    type: z.number().optional(),
    isBirthday: z.boolean().optional(),
    marketplaces: z
      .array(
        z.string().length(2, {
          message: 'max-length should be two for each marketplace.',
        })
      )
      .optional(),
    iconifyName: z.string().optional(),
    iconSvg: z.string().optional(),
    iconUrl: z.string().optional(),
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
