import { z } from 'zod';

import { validateObjectId } from '../../../utils/helpers';

export const generatePayoutSchema = z.object({
  marketplace: z.string().length(2),
  walletIds: z.array(z.string().refine((id) => id && validateObjectId(id))),
});

export const finalizePayoutSchema = z.object({
  payoutId: z.string().refine((id) => id && validateObjectId(id)),
  items: z
    .array(
      z.object({
        PartnerPayout: z.string().refine((id) => id && validateObjectId(id)),
        status: z.enum(['pending', 'paid']).optional(),
      })
    )
    .optional(),
});
