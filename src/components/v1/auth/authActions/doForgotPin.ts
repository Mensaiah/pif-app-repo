import { Response } from 'express';
import { z } from 'zod';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { sendOtpEmail } from '../../notification/notification.util';
import { UserModel } from '../../user/user.model';
import { OtpCodeModel, UserAccessModel } from '../auth.models';
import { forgotPinSchema } from '../auth.policy';
import { generateRandomCode, sendOTP } from '../auth.utils';

export const doForgotPin = async (req: IRequest, res: Response) => {
  type forgotPinDataType = z.infer<typeof forgotPinSchema>;

  const { phone, phonePrefix, email }: forgotPinDataType = req.body;

  try {
    const existingUsers = await UserModel.find({
      'contact.phonePrefix': phonePrefix,
      'contact.phone': phone,
      userType: 'customer',
      ...(email && { email }),
    });

    if (!existingUsers.length)
      return handleResponse(res, 'Account does not exist', 401);

    if (existingUsers.length > 1 && !email) {
      return handleResponse(res, 'Please, provide your email', 401);
    }

    const existingUser = existingUsers[0];

    const existingUserAccess = await UserAccessModel.findOne({
      User: existingUser._id,
    });
    if (!existingUserAccess)
      return handleResponse(
        res,
        'OTP could not be generated at this time. Please try again later',
        401
      );

    if (existingUserAccess?.isBlocked)
      return handleResponse(res, 'Account blocked, contact support', 401);

    const newOtpCode = await new OtpCodeModel({
      User: existingUser._id,
      code: generateRandomCode(),
      purpose: 'pin-reset',
      phone,
      phonePrefix,
      lastSent: new Date(),
      ...(email && { email }),
    }).save();

    if (existingUser.isConfirmed) {
      await sendOTP(phonePrefix + phone, newOtpCode.code);
    } else {
      await sendOtpEmail(email, newOtpCode.code);
    }

    return handleResponse(res, 'Enter OTP and new pin to proceed');
  } catch (err) {
    handleResponse(res, useWord('internalServerError', req.lang), 500, err);
  }
};

export default doForgotPin;
