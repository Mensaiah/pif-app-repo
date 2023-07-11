import { z } from 'zod';

import { langSchema } from '../../../types/global';

export const addInfoSchema = z.object({
  title: z.string(),
  content: z.object(langSchema),
  iconifyName: z.string().optional(),
  iconSvg: z.string().optional(),
  iconUrl: z.string().optional(),
  isPublished: z.boolean(),
  isNewInfo: z.boolean().optional(),
});

export const updateInfoSchema = z.object({
  title: z.string().optional(),
  content: z.object(langSchema).optional(),
  iconifyName: z.string().optional().optional(),
  iconSvg: z.string().optional(),
  iconUrl: z.string().optional(),
  isPublished: z.boolean().optional(),
});

export const addLegalPolicySchema = z.object({
  title: z.string(),
  content: z.object(langSchema),
  isPublished: z.boolean(),
  isNewPolicy: z.boolean().optional(),
});

export const updateLegalPolicySchema = z.object({
  title: z.string().optional(),
  content: z.object(langSchema).optional(),
  isPublished: z.boolean().optional(),
});

export const addFaqSchema = z.object({
  question: z.string(),
  answer: z.string(),
  isDraft: z.boolean().optional(),
});

export const updateFaqSchema = addFaqSchema; //addFaqSchema.omit({ isDraft: true });
