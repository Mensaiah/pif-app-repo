import { Response } from 'express';
import { z } from 'zod';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { UserModel } from '../../user/user.model';
import { OtpCodeModel } from '../auth.models';
import { resendOTPSchema } from '../auth.policy';
import {
  generateRandomCode,
  isDateLessThanXMinutesAgo,
  sendOTP,
} from '../auth.utils';

const resendMobileOtp = async (req: IRequest, res: Response) => {
  type verifyDataType = z.infer<typeof resendOTPSchema>;

  const { purpose, email }: verifyDataType = req.body;

  try {
    const existingUser = await UserModel.findOne({
      userType: 'customer',
      email,
    });

    if (!existingUser) return handleResponse(res, 'Invalid request', 401);

    const otpExists = await OtpCodeModel.findOne({
      email,
      purpose,
      isDeleted: { $ne: true },
    });

    if (!otpExists) return handleResponse(res, 'Invalid request', 401);

    if (isDateLessThanXMinutesAgo(otpExists.lastSent))
      return handleResponse(
        res,
        'Please wait for at least 1 minute before you try again',
        401
      );

    if (purpose === 'confirm-account' && existingUser.isConfirmed)
      return handleResponse(
        res,
        'Your account has been verified. You do not need OTP anymore',
        401
      );

    if (otpExists.expiresAt < new Date()) {
      otpExists.code = generateRandomCode();
      await otpExists.save();
    }

    await sendOTP(email, otpExists.code);

    return handleResponse(res, 'Please recheck your mail for OTP code');
  } catch (err) {}
};

export default resendMobileOtp;
