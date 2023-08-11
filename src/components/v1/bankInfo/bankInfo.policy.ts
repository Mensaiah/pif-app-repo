import { z } from 'zod';

import platformConstants from '../../../config/platformConstants';

export const listBanksSchema = z.object({
  driver: z.enum(['paystack']),
  marketplace: z.string().length(2, {
    message: 'length should be 2.',
  }),
});

export const resolveBankAccountSchema = z.object({
  driver: z.enum(['paystack']),
  marketplace: z.string().length(2, {
    message: 'length should be 2.',
  }),
  accountNumber: z.string(),
  bankCode: z.string(),
});

export const addBankAccountSchema = z.object({
  driver: z.enum(platformConstants.paymentProcessors),
  marketplace: z.string().length(2, {
    message: 'length should be 2.',
  }),
  accountNumber: z.string(),
  bankCode: z.string(),
});
