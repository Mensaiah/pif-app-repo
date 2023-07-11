import { z } from 'zod';

export const dashLoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const forgotPasswordSchema = z.object({
  email: z.string(),
});

export const resetPasswordSchema = z.object({
  otpCode: z.string(),
  password: z.string(),
  email: z.string(),
});

export const mobileLoginSchema = z.object({
  phonePrefix: z.string(),
  phone: z.string(),
  pin: z.string(),
});

export const mobileSignupSchema = z.object({
  phonePrefix: z.string(),
  phone: z.string(),
  marketplace: z.string().length(2, {
    message: 'length should be 2.',
  }),
});

export const verifyOTP = z.object({
  phonePrefix: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  code: z.string(),
  purpose: z.enum(['signup', 'pin-reset', 'password-reset']),
});

export const verifyOTPSchema = verifyOTP.refine(
  ({ phone, phonePrefix, email }) => (phonePrefix && phone) || email,
  {
    message: 'You must provide either email or phone and phonePrefix.',
  }
);

export const resendOTPSchema = verifyOTP
  .omit({ code: true })
  .refine(({ email, phone, phonePrefix }) => email || (phone && phonePrefix), {
    message: 'You must provide either email or phone and phonePrefix.',
  });

export const finalizeMobileSignupSchema = z.object({
  phonePrefix: z.string(),
  phone: z.string(),
  name: z.string(),
  zipCode: z.string(),
  dob: z.string(),
  pifId: z.string(),
  otpCode: z.string(),
});

export const setPinSchema = z.object({
  pin: z.string().length(4, 'Four digit pin is required'),
});

export const forgotPinSchema = z.object({
  phonePrefix: z.string(),
  phone: z.string(),
});

export const resetPinSchema = z.object({
  otpCode: z.string(),
  pin: z.string(),
  phone: z.string(),
  phonePrefix: z.string(),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string(),
  newPassword: z.string(),
});

export const changePinSchema = z.object({
  oldPin: z.string(),
  newPin: z.string(),
});
