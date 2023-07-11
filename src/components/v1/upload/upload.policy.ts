import { z } from 'zod';

export const uploadDirectSchema = z.object({
  url: z.string().url(),
});
