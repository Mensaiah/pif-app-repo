import { Response } from 'express';
import { z } from 'zod';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { UserModel } from '../../user/user.model';
import { OtpCodeModel } from '../auth.models';
import { resendOTPSchema } from '../auth.policy';
import {
  isDateLessThanXMinutesAgo,
  generateRandomCode,
  sendOTP,
  sendForgotPasswordCodeMail,
} from '../auth.utils';

const resendOtpcode = async (req: IRequest, res: Response) => {
  type verifyDataType = z.infer<typeof resendOTPSchema>;

  const { phone, phonePrefix, purpose, email }: verifyDataType = req.body;

  try {
    const existingUser = await UserModel.findOne(
      phonePrefix && phone
        ? {
            userType: 'customer',
            'contact.phone': phone,
            'contact.phonePrefix': phonePrefix,
          }
        : {
            email,
            userType: { $ne: 'customer' },
          }
    );

    if (!existingUser) return handleResponse(res, 'Invalid request', 401);

    const otpExists = await OtpCodeModel.findOne(
      phonePrefix && phone
        ? {
            purpose,
            phone,
            phonePrefix,
            isDeleted: { $ne: true },
          }
        : {
            email,
            purpose,
            isDeleted: { $ne: true },
          }
    );

    if (!otpExists) return handleResponse(res, 'Invalid request', 401);

    if (isDateLessThanXMinutesAgo(otpExists.lastSent))
      return handleResponse(
        res,
        'Please wait for at least 1 minute before you try again',
        401
      );

    if (
      purpose === 'signup' &&
      phonePrefix &&
      phone &&
      existingUser.isSignupComplete
    )
      return handleResponse(
        res,
        'Signup completed. You do not need OTP anymore',
        401
      );

    if (otpExists.expiresAt < new Date()) {
      otpExists.code = generateRandomCode();
      await otpExists.save();
    }

    if (email && purpose === 'password-reset') {
      await sendForgotPasswordCodeMail({ to: email, code: otpExists.code });

      return handleResponse(res, 'Please recheck your mail for OTP code');
    }

    await sendOTP(phonePrefix + phone, otpExists.code);

    return handleResponse(res, 'OTP code has been sent');
  } catch (err) {
    handleResponse(res, useWord('internalServerError', req.lang), 500, err);
  }
};
export default resendOtpcode;
