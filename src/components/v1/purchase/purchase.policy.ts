import { z } from 'zod';

export const passOnPifSchema = z
  .object({
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
    ({ recipientPifId, recipientPhonePrefix, recipientPhoneNumber }) =>
      recipientPifId || (recipientPhonePrefix && recipientPhoneNumber),
    {
      message:
        'Either recipientPifId or recipientPhonePrefix and recipientPhoneNumber must be supplied',
    }
  );
