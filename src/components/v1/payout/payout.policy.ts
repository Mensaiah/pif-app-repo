import { z } from 'zod';

import { validateObjectId } from '../../../utils/helpers';

export const generatePayoutSchema = z.object({
  marketplace: z.string().length(2),
  walletIds: z.array(z.string().refine((id) => id && validateObjectId(id))),
});
