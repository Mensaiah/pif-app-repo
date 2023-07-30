import { z } from 'zod';

const paymentProcessor = z.enum(['paystack', 'stripe', 'nets', 'mobilePay']);

const social = z.object({
  name: z.string(),
  url: z.string(),
});

export const addMarketplaceSchema = z.object({
  name: z.string(),
  code: z.string(),
  currency: z.string(),
  currencyCode: z.string(),
  language: z.string(),
  languageCode: z.string(),
  currencySymbol: z.string(),
  paymentProcessors: z.array(paymentProcessor),
  socials: z.array(social).optional(),
});

export const updateMarketplaceSchema = z.object({
  name: z.string().optional(),
  code: z.string(),
  currency: z.string().optional(),
  currencyCode: z.string().optional(),
  language: z.string().optional(),
  languageCode: z.string().optional(),
  currencySymbol: z.string().optional(),
  paymentProcessors: z.array(paymentProcessor).optional(),
  socials: z.array(social).optional(),
});

export const addPlatformSocialSchema = z.object({
  name: z.string(),
  url: z.string(),
});

export const updatePlatformSocialSchema = z.object({
  name: z.string(),
  url: z.string(),
});
