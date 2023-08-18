/* eslint-disable max-lines */
import { z } from 'zod';

import { langSchema } from '../../../types/global';
import {
  checkLang,
  validateDate,
  validateObjectId,
} from '../../../utils/helpers';

export const addProductSchema = z
  .object({
    name: z.object(langSchema),
    caption: z.object(langSchema).optional(),
    description: z.object(langSchema),
    disclaimer: z.object(langSchema).optional(),
    partnerId: z.string(),
    tags: z.array(z.string()).optional(),
    price: z.number(),
    categories: z.array(z.string()),
    internalCategory: z.string().optional(),
    isRated18: z.boolean().optional(),
    photo: z.string().optional(),
    photos: z.array(z.string()).optional(),
    marketplace: z.string(),
    extraProduct: z
      .object({
        description: z.object(langSchema),
        photo: z.string().optional(),
      })
      .optional(),
    productType: z.enum(['regular-product', 'free-gift']).optional(),
    validThru: z.string().optional(),
    textForReceiver: z.object(langSchema).optional(),
    quantity: z.number(),
    quantityAlert: z.number().optional(),
    isCountedTowardsReward: z.boolean().optional(),
    canBeRedeemedAsRewards: z.boolean().optional(),
    isBonusProductOnly: z.boolean().optional(),
    canBeSent: z.enum(['immediately', 'next-period']).optional(),
    canBeSentPeriodType: z.enum(['hour', 'day', 'week', 'month']).optional(),
    canBeSentPeriodValue: z.number().optional(),
    redemptionValidityType: z.enum(['date', 'period']),
    redemptionValidityPeriodType: z
      .enum(['days', 'weeks', 'months'])
      .optional(),
    redemptionValidityValue: z.union([
      z
        .number()
        .positive()
        .refine((value) => !Number.isNaN(value), {
          message: 'Value should be a valid positive number.',
        }),
      z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
        message: 'Value should be a valid date string.',
      }),
    ]),
    slicePrice: z.number().optional(),
    redeemType: z
      .enum([
        'mobile-redemption',
        'unique-codes-offline-with-confirmation',
        'unique-codes-offline-without-confirmation',
        'non-unique-codes-offline',
      ])
      .optional(),
  })
  .refine(
    ({
      redemptionValidityPeriodType,
      redemptionValidityType,
      redemptionValidityValue,
    }) => {
      if (
        redemptionValidityType === 'period' &&
        !redemptionValidityPeriodType &&
        !redemptionValidityValue
      )
        return false;

      return true;
    },
    {
      message: 'Redemption validity value or period type is missing',
    }
  )
  .refine(
    ({ canBeSent, canBeSentPeriodType, canBeSentPeriodValue }) => {
      if (
        canBeSent &&
        canBeSent !== 'immediately' &&
        !canBeSentPeriodType &&
        !canBeSentPeriodValue
      )
        return false;

      return true;
    },
    { message: 'either can be sent period type or period value is missing' }
  )
  .refine(
    ({ validThru }) => {
      if (validThru && !validateDate(validThru)) return false;
      return true;
    },
    {
      message: 'validThru is an invalid date',
    }
  )
  .refine(
    ({ name, description }) => {
      if (!checkLang(name)) return false;
      if (!checkLang(description)) return false;
      return true;
    },
    {
      message:
        'either name and description is missing or their language is not supported',
    }
  )
  .refine(
    ({ caption, disclaimer }) => {
      if (caption && !checkLang(caption)) return false;
      if (disclaimer && !checkLang(disclaimer)) return false;

      return true;
    },
    {
      message:
        'the language provided for caption or disclaimer is not supported',
    }
  )
  .refine(
    ({ categories }) => {
      const validateCategories = categories.every((val) =>
        validateObjectId(val)
      );

      if (categories.length === 0 || !validateCategories) return false;

      return true;
    },
    { message: 'categories id(s) are missing or not valid.' }
  )
  .refine(
    ({ internalCategory }) => {
      if (internalCategory && !validateObjectId(internalCategory)) return false;

      return true;
    },
    { message: 'Internal category is not valid' }
  )
  .refine(
    ({ partnerId }) => {
      if (partnerId && !validateObjectId(partnerId)) return false;

      return true;
    },
    { message: 'Partner Id is not valid' }
  )
  .refine(
    ({ marketplace }) => {
      if (marketplace && marketplace.length === 2) return true;

      return false;
    },
    {
      message: 'marketplace is missing or invalid',
    }
  );

export const updateProductSchema = z
  .object({
    name: z.object(langSchema).optional(),
    caption: z.object(langSchema).optional(),
    description: z.object(langSchema).optional(),
    disclaimer: z.object(langSchema).optional(),
    tags: z.array(z.string()).optional(),
    price: z.number().optional(),
    categories: z.array(z.string()).optional(),
    internalCategory: z.string().optional(),
    isRated18: z.boolean().optional(),
    photo: z.string().optional(),
    photos: z.array(z.string()).optional(),
    extraProduct: z
      .object({
        description: z.object(langSchema),
        photo: z.string().optional(),
      })
      .optional(),
    productType: z.enum(['regular-product', 'free-gift']).optional(),
    validThru: z.string().optional(),
    textForReceiver: z.object(langSchema).optional(),
    quantity: z.number().optional(),
    quantityAlert: z.number().optional(),
    isCountedTowardsReward: z.boolean().optional(),
    canBeRedeemedAsRewards: z.boolean().optional(),
    isBonusProductOnly: z.boolean().optional(),
    canBeSent: z.enum(['immediately', 'next-period']).optional(),
    canBeSentPeriodType: z.enum(['hour', 'day', 'week', 'month']).optional(),
    canBeSentPeriodValue: z.number().optional(),
    redemptionValidityType: z.enum(['date', 'period']).optional(),
    redemptionValidityPeriodType: z
      .enum(['days', 'weeks', 'months'])
      .optional(),
    redemptionValidityValue: z.string().optional(),
    slicePrice: z.number().optional(),
    redeemType: z
      .enum([
        'mobile-redemption',
        'unique-codes-offline-with-confirmation',
        'unique-codes-offline-without-confirmation',
        'non-unique-codes-offline',
      ])
      .optional(),
  })
  .refine(
    ({ quantity, quantityAlert }) => {
      if (
        (quantity && quantity !== -1 && !quantityAlert) ||
        (!quantity && quantityAlert)
      )
        return false;

      return true;
    },
    { message: 'quantity or quantity alert is missing.' }
  )
  .refine(
    ({ name, description }) => {
      if (
        (name && !checkLang(name)) ||
        (description && !checkLang(description))
      )
        return false;

      return true;
    },
    {
      message:
        'the language supplied to either name or description is not supported',
    }
  )
  .refine(
    ({ caption, disclaimer }) => {
      if (
        (caption && !checkLang(caption)) ||
        (disclaimer && !checkLang(disclaimer))
      )
        return false;

      return true;
    },
    {
      message:
        'the language provided for caption or disclaimer is not supported',
    }
  )
  .refine(
    ({ redemptionValidityType, redemptionValidityValue }) => {
      if (
        redemptionValidityType === 'date' &&
        !validateDate(redemptionValidityValue)
      )
        return false;

      return true;
    },
    {
      message: 'Redemption validity value is missing date or is invalid',
    }
  )
  .refine(
    ({
      redemptionValidityPeriodType,
      redemptionValidityType,
      redemptionValidityValue,
    }) => {
      if (
        redemptionValidityType === 'period' &&
        !redemptionValidityPeriodType &&
        !redemptionValidityValue
      )
        return false;

      return true;
    },
    {
      message: 'Redemption validity value or period type is missing',
    }
  )
  .refine(
    ({ canBeSent, canBeSentPeriodType, canBeSentPeriodValue }) => {
      if (
        canBeSent &&
        canBeSent !== 'immediately' &&
        !canBeSentPeriodType &&
        !canBeSentPeriodValue
      )
        return false;

      return true;
    },
    { message: 'Either can be sent period type or period value is missing' }
  )
  .refine(
    ({ validThru }) => {
      if (validThru && !validateDate(validThru)) return false;
      return true;
    },
    {
      message: 'validThru is an invalid date',
    }
  )
  .refine(
    ({ categories }) => {
      if (
        categories &&
        categories.length !== 0 &&
        !categories.every((val) => validateObjectId(val))
      )
        return false;

      return true;
    },
    { message: 'categories id(s) are missing or not valid.' }
  )
  .refine(
    ({ internalCategory }) => {
      if (internalCategory && !validateObjectId(internalCategory)) return false;

      return true;
    },
    { message: 'Internal category is not valid' }
  );

export const addProductSplitPriceSchema = z
  .object({
    code: z.string(),
    discountType: z.enum(['fixed', 'percentage']),
    value: z.number(),
    minimumOrderAmount: z.number().optional(),
    maximumUseCount: z.number().optional(),
    maximumUsePerCustomer: z.number().optional(),
    validityStart: z.string().optional(),
    validityEnd: z.string().optional(),
  })
  .refine(
    ({ validityStart, validityEnd }) => {
      if (!validateDate(validityStart) || !validateDate(validityEnd))
        return false;

      return true;
    },
    {
      message: 'either validity start or end date is invalid.',
    }
  );

export const updateProductSplitPriceSchema = z
  .object({
    newCode: z.string().optional(),
    discountType: z.enum(['fixed', 'percentage']).optional(),
    value: z.number().optional(),
    minimumOrderAmount: z.number().optional(),
    maximumUseCount: z.number().optional(),
    maximumUsePerCustomer: z.number().optional(),
    validityStart: z.string().optional(),
    validityEnd: z.string().optional(),
  })
  .refine(
    ({ validityStart, validityEnd }) => {
      if (
        (validityStart && !validateDate(validityStart)) ||
        (validityEnd && !validateDate(validityEnd))
      )
        return false;

      return true;
    },
    {
      message: 'either validity start or end has an invalid date',
    }
  );

export const addRedeemCodeSchema = z
  .object({
    quantity: z.number().int().positive(),
    codeType: z
      .enum(['alpha_num', 'code128', 'qr_code', 'upc', 'ean8', 'ean13', 'isbn'])
      .optional(),
    expiresAt: z.string().optional(),
  })
  .refine(
    ({ expiresAt }) => {
      if (expiresAt && !validateDate(expiresAt)) return false;

      return true;
    },
    {
      message: 'this expiresAt date is not a valid date',
    }
  );
