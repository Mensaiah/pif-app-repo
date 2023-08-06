import { Response } from 'express';
import { z } from 'zod';

import platformConstants from '../../../../config/platformConstants';
import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { sendOtpEmail } from '../../notification/notification.util';
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
    const existingUser = await UserModel.findOne({
      ...(phonePrefix &&
        phone && {
          'contact.phone': phone,
          'contact.phonePrefix': phonePrefix,
          userType: 'customer',
        }),
      ...(!phonePrefix && !phone && { userType: { $ne: 'customer' } }),
      ...(email && { email }),
    });

    if (!existingUser) return handleResponse(res, 'Invalid request', 401);

    const otpExists = await OtpCodeModel.findOne({
      User: existingUser._id,
      purpose,
      $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }],
    });

    if (!otpExists) return handleResponse(res, 'Invalid request', 401);

    if (isDateLessThanXMinutesAgo(otpExists.lastSent))
      return handleResponse(
        res,
        `Please wait for at least ${platformConstants.otpResendWaitingMinutes} minute before you try again`,
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

    if (existingUser.isConfirmed) {
      await sendOTP(phonePrefix + phone, otpExists.code);
    } else {
      await sendOtpEmail(email, otpExists.code);
    }

    return handleResponse(res, 'OTP code has been sent');
  } catch (err) {
    handleResponse(res, useWord('internalServerError', req.lang), 500, err);
  }
};
export default resendOtpcode;
