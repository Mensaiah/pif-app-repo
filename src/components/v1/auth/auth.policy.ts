import { z } from 'zod';

import appConfig from '../../../config';
import platformConstants from '../../../config/platformConstants';
import { isValidId } from '../../../utils/validators';

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
  captchaToken: appConfig.isDev ? z.string().optional() : z.string(),
});

export const verifyOTP = z.object({
  phonePrefix: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  code: z.string(),
  purpose: z.enum(platformConstants.otpPurpose),
});

export const verifyOTPSchema = verifyOTP
  .refine(({ phone, phonePrefix, email }) => (phonePrefix && phone) || email, {
    message: 'You must provide either email or phone and phonePrefix.',
  })
  .refine(({ phone, phonePrefix, purpose, email }) =>
    purpose === 'confirm-account' ? phone && phonePrefix && email : true
  );

export const resendOTPSchema = verifyOTP
  .omit({ code: true })
  .refine(({ email, phone, phonePrefix }) => email || (phone && phonePrefix), {
    message: 'You must provide either email or phone and phonePrefix.',
  });

export const finalizeMobileSignupSchema = z
  .object({
    phonePrefix: z.string(),
    phone: z.string(),
    name: z.string(),
    zipCode: z.string(),
    dob: z.string(),
    email: z.string().email(),
    pifId: z.string(),
    otpCode: z.string().optional(),
    referenceCode: z.string().optional(),
  })
  .refine(({ otpCode, referenceCode }) => otpCode || referenceCode)
  .refine(
    ({ referenceCode }) => {
      if (!referenceCode) return true;

      const refCode = referenceCode.slice(2, -5);
      if (referenceCode && !isValidId(refCode)) return false;
      return true;
    },
    {
      message: 'invalid reference id or not supplied',
    }
  );

export const setPinSchema = z.object({
  pin: z.string().length(4, 'Four digit pin is required'),
});

export const forgotPinSchema = z.object({
  phonePrefix: z.string(),
  phone: z.string(),
  email: z.string().email().optional(),
});

export const resetPinSchema = z.object({
  otpCode: z.string(),
  pin: z.string(),
  phone: z.string(),
  phonePrefix: z.string(),
  email: z.string().email().optional(),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string(),
  newPassword: z.string(),
});

export const changePinSchema = z.object({
  oldPin: z.string(),
  newPin: z.string(),
});

export const resendMobileOtpSchema = z.object({
  purpose: z.enum(platformConstants.otpPurpose),
  email: z.string().email(),
});
