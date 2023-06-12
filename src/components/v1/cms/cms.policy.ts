import { z } from 'zod';

import appConfig from '../../../config';

const { supportedLanguages } = appConfig;

const contentSchema: Partial<
  Record<(typeof supportedLanguages)[number], z.ZodString>
> = {};
supportedLanguages.forEach((language) => {
  contentSchema[language] = z.string();
});

export const addInfoSchema = z.object({
  title: z.string(),
  content: z.object(contentSchema),
  iconifyName: z.string().optional(),
  iconSvg: z.string().optional(),
  iconUrl: z.string().optional(),
  isPublished: z.boolean(),
  isNewInfo: z.boolean().optional(),
});

export const updateInfoSchema = z.object({
  title: z.string().optional(),
  content: z.object(contentSchema).optional(),
  iconifyName: z.string().optional().optional(),
  iconSvg: z.string().optional(),
  iconUrl: z.string().optional(),
  isPublished: z.boolean().optional(),
});

export const addLegalPolicySchema = z.object({
  title: z.string(),
  content: z.object(contentSchema),
  isPublished: z.boolean(),
  isNewPolicy: z.boolean().optional(),
});

export const updateLegalPolicySchema = z.object({
  title: z.string().optional(),
  content: z.object(contentSchema).optional(),
  isPublished: z.boolean().optional(),
});

export const addFaqSchema = z.object({
  question: z.string(),
  answer: z.string(),
  isDraft: z.boolean().optional(),
});

export const updateFaqSchema = addFaqSchema; //addFaqSchema.omit({ isDraft: true });
