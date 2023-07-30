import { z } from 'zod';

import platformConstants from '../../../config/platformConstants';

export const initiateOrderSchema = z.object({
  idempotencyKey: z.string().uuid(),
  driver: z.enum(platformConstants.paymentProcessors),
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
  recipientPhonePrefix: z.string(),
  recipientPhoneNumber: z.string(),
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
});
