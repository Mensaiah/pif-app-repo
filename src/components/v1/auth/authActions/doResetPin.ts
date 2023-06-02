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

  const { otpCode, pin }: resetPinDataType = req.body;

  try {
    const existingOTP = await OtpCodeModel.findOne({
      code: otpCode,
    });

    if (!existingOTP) return handleResponse(res, 'OTP code is invalid', 401);

    if (existingOTP.expiresAt < new Date())
      return handleResponse(res, 'OTP has expired', 401);

    const existingUser = await UserModel.findOne({
      'contact.phonePrefix': existingOTP.phonePrefix,
      'contact.phone': existingOTP.phone,
    });

    if (!existingUser) return handleResponse(res, 'User does not exist', 401);

    const existingUserAccess = await UserAccessModel.findOne({
      User: existingUser._id,
    });

    if (!existingUserAccess) return handleResponse(res, 'invalid request', 401);

    existingUserAccess.pin = pin;

    await existingUserAccess.save();

    return handleResponse(res, 'Pin reset successful, kindly login.', 201);
  } catch (err) {
    handleResponse(res, useWord('internalServerError', req.lang), 500, err);
  }
};

export default doResetPin;
