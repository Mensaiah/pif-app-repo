import { z } from 'zod';

import { isValidId } from '../../../utils/validators';

const partnerSchema = z.object({
  name: z.string(),
  email: z.string(),
  marketplaces: z.array(
    z.string().length(2, {
      message: 'max-length should be two for each marketplace.',
    })
  ),
  vat: z.string().optional(),
  phonePrefix: z.string(),
  phone: z.string(),
  fax: z.string().optional(),
  website: z.string().optional(),
  isCharity: z.boolean().optional(),
  headquarterCountry: z.string().optional(),
  headquarterCity: z.string(),
  headquarterZipCode: z.string().optional(),
  headquarterAddress: z.string().optional(),
  bankName: z.string(),
  bankCountry: z.string(),
  accountName: z.string(),
  accountNumber: z.string(),
  currency: z.string(),
  isPeriodically: z.boolean().optional(),
  periodType: z.enum(['daily', 'weekly', 'monthly']).optional(),
  isAmountThreshold: z.boolean().optional(),
  amountThreshold: z.number().optional(),
  startProportion: z.number().optional(),
  finishProportion: z.number().optional(),
  pifProportion: z.number().optional(),
  fixedFee: z.number().optional(),
  enableTransactionFeeManualSettings: z.boolean().optional(),
  transactionAmount: z.number().optional(),
  transactionMaximumAmount: z.number().optional(),
  redeemType: z.enum([
    'mobile-redemption',
    'unique-codes-offline-with-confirmation',
    'unique-codes-offline-without-confirmation',
    'non-unique-codes-offline',
  ]),
  enableRewardSystem: z.boolean().optional(),
  status: z.enum(['active', 'inactive', 'not-verified']),
  ftpHost: z.string().optional(),
  ftpLogin: z.string().optional(),
  ftpPass: z.string().optional(),
  ftpLastSync: z.string().optional(),
  apiLogin: z.string().optional(),
  apiPass: z.string().optional(),
  apiCodeType: z.string().optional(),
  logoCropData: z
    .object({ scd: z.string().optional(), sd: z.string().optional() })
    .optional(),
  contractDocuments: z
    .array(
      z.object({
        filename: z.string(),
        source: z.string(),
        deletedAt: z.date().optional(),
      })
    )
    .optional(),
  adminEmail: z.string().optional(),
  adminName: z.string().optional(),
});

export const addPartnerSchema = partnerSchema
  .refine(
    ({
      isPeriodically,
      periodType,
      amountThreshold,
      isAmountThreshold,
      enableTransactionFeeManualSettings,
      transactionAmount,
      transactionMaximumAmount,
    }) => {
      if (
        (isPeriodically && periodType) ||
        (isAmountThreshold && amountThreshold)
      )
        return true;

      if (
        enableTransactionFeeManualSettings &&
        transactionAmount &&
        transactionMaximumAmount
      )
        return true;

      return false;
    },
    {
      message:
        'Invalid combination of data(s) or missing, period type, amount threshold, transaction fee manual settings, or make partner admin.',
    }
  )
  .refine(
    ({ adminEmail, adminName }) => {
      if (!adminEmail && adminName) return false;
      if (!adminName && adminEmail) return false;
      return true;
    },
    {
      message: 'adminEmail or adminName is missing,',
    }
  );

export const updatePartnerSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  marketplaces: z
    .array(
      z.string().length(2, {
        message: 'max-length should be 2 for each marketplace.',
      })
    )
    .optional(),
  vat: z.string().optional(),
  phonePrefix: z.string().optional(),
  phone: z.string().optional(),
  fax: z.string().optional(),
  website: z.string().optional(),
  isCharity: z.boolean().optional(),
  headquarterCountry: z.string().optional(),
  headquarterCity: z.string().optional(),
  headquarterZipCode: z.string().optional(),
  headquarterAddress: z.string().optional(),
  bankName: z.string().optional(),
  bankCountry: z.string().optional(),
  accountName: z.string().optional(),
  accountNumber: z.string().optional(),
  currency: z.string().optional(),
  isPeriodically: z.boolean().optional(),
  periodType: z.enum(['daily', 'weekly', 'monthly']).optional(),
  isAmountThreshold: z.boolean().optional(),
  amountThreshold: z.number().optional(),
  startProportion: z.number().optional(),
  finishProportion: z.number().optional(),
  pifProportion: z.number().optional(),
  fixedFee: z.number().optional(),
  enableTransactionFeeManualSettings: z.boolean().optional(),
  transactionAmount: z.number().optional(),
  transactionMaximumAmount: z.number().optional(),
  redeemType: z
    .enum([
      'mobile-redemption',
      'unique-codes-offline-with-confirmation',
      'unique-codes-offline-without-confirmation',
      'non-unique-codes-offline',
    ])
    .optional(),
  enableRewardSystem: z.boolean().optional(),
  status: z.enum(['active', 'inactive', 'not-verified']).optional(),
  ftpHost: z.string().optional(),
  ftpLogin: z.string().optional(),
  ftpPass: z.string().optional(),
  ftpLastSync: z.string().optional(),
  apiLogin: z.string().optional(),
  apiPass: z.string().optional(),
  apiCodeType: z.string().optional(),
  logoCropData: z
    .object({ scd: z.string().optional(), sd: z.string().optional() })
    .optional(),
  contractDocuments: z
    .array(
      z.object({
        filename: z.string(),
        source: z.string(),
        deletedAt: z.date().optional(),
      })
    )
    .optional(),
  adminEmail: z.string().optional(),
  adminName: z.string().optional(),
});

export const partnerInviteSchema = z
  .object({
    adminName: z.string(),
    adminEmail: z.string().email(),
    userType: z.enum(['partner-admin']),
    role: z.enum(['partner-admin', 'local-partner', 'pos-user']),
    partnerId: z.string().optional(),
    posId: z.string().optional(),
  })
  .refine(
    ({ role, posId }) => {
      const isValidPosID = isValidId(posId);

      if (role === 'local-partner' && !isValidPosID) return false;

      if (isValidPosID && role !== 'local-partner') return false;

      return true;
    },
    {
      message: 'either role is not a local partner or posId is missing',
    }
  );
