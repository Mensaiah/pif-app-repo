import { z } from 'zod';

export const dashLoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const mobileLoginSchema = z.object({
  phonePrefix: z.string(),
  phone: z.string(),
});
