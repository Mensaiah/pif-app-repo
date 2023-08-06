import { Response } from 'express';
import { z } from 'zod';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { UserModel } from '../../user/user.model';
import { OtpCodeModel, UserAccessModel } from '../auth.models';
import { resetPinSchema } from '../auth.policy';

const doResetPin = async (req: IRequest, res: Response) => {
  type resetPinDataType = z.infer<typeof resetPinSchema>;

  const { otpCode, pin, phone, phonePrefix, email }: resetPinDataType =
    req.body;

  try {
    const existingOTP = await OtpCodeModel.findOne({
      code: otpCode,
      phonePrefix,
      phone,
      ...(email && { email }),
    }).sort({ createdAt: -1 });

    if (!existingOTP) return handleResponse(res, 'OTP code is invalid', 401);

    const users = await UserModel.find({
      'contact.phonePrefix': phonePrefix,
      'contact.phone': phone,
      userType: 'customer',
      ...(email && { email }),
    });

    if (users.length > 1 && !email) {
      return handleResponse(res, 'Please provide email', 401);
    }

    if (existingOTP.expiresAt < new Date())
      return handleResponse(res, 'OTP has expired', 401);

    const otpUser = await UserModel.findOne({
      _id: existingOTP.User,
    });
    const existingUser = users[0];

    if (!otpUser) return handleResponse(res, 'User does not exist', 401);

    if (existingUser._id.toString() !== existingOTP.User.toString()) {
      return handleResponse(res, 'OTP code is invalid', 401);
    }

    const existingUserAccess = await UserAccessModel.findOne({
      User: existingUser._id,
    });

    if (!existingUserAccess) return handleResponse(res, 'invalid request', 401);

    existingUserAccess.updatePin(pin);

    await existingUserAccess.save();

    return handleResponse(res, 'Pin reset successful, kindly login.', 201);
  } catch (err) {
    handleResponse(res, useWord('internalServerError', req.lang), 500, err);
  }
};

export default doResetPin;
