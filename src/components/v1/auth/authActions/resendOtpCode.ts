import { Response } from 'express';
import { IRequest } from 'src/types/global';
import { handleResponse } from 'src/utils/helpers';
import { useWord } from 'src/utils/wordSheet';
import { z } from 'zod';
import { UserModel } from '../../user/user.model';
import { OtpCodeModel } from '../auth.models';
import { verifyMobileSignupSchema } from '../auth.policy';
import {
  isDateLessThanXMinutesAgo,
  generateRandomCode,
  sendOTP,
} from '../auth.utils';

const resendOtpcode = async (req: IRequest, res: Response) => {
  type verifyDataType = z.infer<typeof verifyMobileSignupSchema>;

  const { phone, phonePrefix, code }: verifyDataType = req.body;

  try {
    const existingUser = await UserModel.findOne({
      userType: 'customer',
      'contact.phone': phone,
      'contact.phonePrefix': phonePrefix,
    });

    if (!existingUser) return handleResponse(res, 'Invalid request', 401);

    const otpExists = await OtpCodeModel.findOne({
      phone,
      phonePrefix,
      code,
      purpose: 'signup',
    });
    if (!otpExists) return handleResponse(res, 'Invalid request', 401);

    if (isDateLessThanXMinutesAgo(otpExists.lastSent))
      return handleResponse(
        res,
        'Please wait for at least 1 minute before you try again'
      );

    if (existingUser.isSignupComplete)
      return handleResponse(
        res,
        'Signup comple. You do not need OTP anymore',
        401
      );

    if (otpExists.expiresAt < new Date()) {
      otpExists.code = generateRandomCode();
      await otpExists.save();
    }

    await sendOTP(phonePrefix + phone, otpExists.code);

    return handleResponse(res, 'OTP code has been sent');
  } catch (err) {
    handleResponse(res, useWord('internalServerError', req.lang), 500, err);
  }
};
export default resendOtpcode;
