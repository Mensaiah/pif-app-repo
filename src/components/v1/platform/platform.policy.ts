import { z } from 'zod';

export const addMarketplaceSchema = z.object({
  name: z.string(),
  code: z.string(),
  currency: z.string(),
  currencyCode: z.string(),
  language: z.string(),
  languageCode: z.string(),
});

export const updateMarketplaceSchema = z.object({
  name: z.string().optional(),
  code: z.string(),
  currency: z.string().optional(),
  currencyCode: z.string().optional(),
  language: z.string().optional(),
  languageCode: z.string().optional(),
});

export const addPlatformSocialSchema = z.object({
  name: z.string(),
  url: z.string(),
});

export const updatePlatformSocialSchema = z.object({
  name: z.string(),
  url: z.string(),
});
