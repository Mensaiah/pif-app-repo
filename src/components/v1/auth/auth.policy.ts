import { z } from 'zod';

export const dashLoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const mobileLoginSchema = z.object({
  phonePrefix: z.string(),
  phone: z.string(),
  pin: z.string(),
});

export const mobileSignupSchema = z.object({
  phonePrefix: z.string(),
  phone: z.string(),
  marketplace: z.string(),
});
export const verifyMobileSignupSchema = z.object({
  phonePrefix: z.string(),
  phone: z.string(),
  code: z.string(),
});

export const finalizeMobileSignupSchema = z.object({
  phonePrefix: z.string(),
  phone: z.string(),
  name: z.string(),
  zipCode: z.string(),
  dob: z.date(),
  pifId: z.string(),
  otpCode: z.string(),
});

export const setPinSchema = z.object({
  pin: z.string().length(4, 'Four digit pin is required'),
});
