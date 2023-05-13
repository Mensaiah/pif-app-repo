import { Response } from 'express';
import { z } from 'zod';

import { IRequest } from '../../../../types/global';
import { consoleLog, handleResponse } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { UserModel } from '../../user/user.model';
import { OtpCodeModel } from '../auth.models';
import { verifyMobileSignupSchema } from '../auth.policy';

const verifyMobileSignup = async (req: IRequest, res: Response) => {
  type verifyDataType = z.infer<typeof verifyMobileSignupSchema>;

  const { phone, phonePrefix, code }: verifyDataType = req.body;
  consoleLog({ phone, phonePrefix, code });

  try {
    const existingUser = await UserModel.findOne({
      userType: 'customer',
      'contact.phone': phone,
      'contact.phonePrefix': phonePrefix,
    });

    if (!existingUser)
      return handleResponse(res, 'Account does not exist', 401);

    const otpExists = await OtpCodeModel.findOne({
      code,
      purpose: 'signup',
      phone,
      phonePrefix,
    });

    if (!otpExists) return handleResponse(res, 'OTP code is invalid', 401);

    if (otpExists.expiresAt < new Date()) {
      return handleResponse(res, 'OTP has expired');
    }

    existingUser.isConfirmed = true;
    otpExists.isConfirmed = true;
    await otpExists.save();
    await existingUser.save();

    return handleResponse(res, 'Verification successful');
  } catch (err) {
    handleResponse(res, useWord('internalServerError', req.lang), 500, err);
  }
};
export default verifyMobileSignup;
