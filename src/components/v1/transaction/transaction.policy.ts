import { z } from 'zod';

import platformConstants from '../../../config/platformConstants';

const validateDriver = (val: any) => {
  const availableOptions = Object.values(platformConstants.paymentProcessors);
  return availableOptions.includes(val);
};

export const initiateOrderSchema = z
  .object({
    idempotencyKey: z.string().uuid(),
    driver: z.string().refine(validateDriver, {
      message: 'Invalid payment option',
    }),
    items: z
      .array(
        z.object({
          productId: z.string(),
          quantity: z.number().int().positive(),
          discountCode: z.string().optional(),
        })
      )
      .nonempty('must be supplied. 1 item (at least) is required'),
    recipientPifId: z.string().optional(),
    recipientPhonePrefix: z.string().optional(),
    recipientPhoneNumber: z.string().optional(),
    message: z.string().optional(),
    contactId: z.string().optional(),
    toBeDeliveredAt: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'toBeDeliveredAt must be a valid date string',
      })
      .refine((val) => new Date(val).getTime() > Date.now(), {
        message: 'toBeDeliveredAt must be a future date',
      }),
  })
  .refine(
    ({
      recipientPifId,
      recipientPhonePrefix,
      recipientPhoneNumber,
      contactId,
    }) =>
      recipientPifId ||
      (recipientPhonePrefix && recipientPhoneNumber) ||
      contactId,
    {
      message:
        'Either recipientPifId or recipientPhonePrefix and recipientPhoneNumber must be supplied',
    }
  );

export const listBanksSchema = z.object({
  driver: z.string(),
  marketplace: z.string().length(2, {
    message: 'length should be 2.',
  }),
});
