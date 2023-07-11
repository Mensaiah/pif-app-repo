import { Response } from 'express';
import { z } from 'zod';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { UserModel } from '../../user/user.model';
import { OtpCodeModel, UserAccessModel } from '../auth.models';
import { resetPasswordSchema } from '../auth.policy';

const doResetPassword = async (req: IRequest, res: Response) => {
  type resetPasswordDataType = z.infer<typeof resetPasswordSchema>;

  const { otpCode, password, email }: resetPasswordDataType = req.body;
  try {
    const existingOTP = await OtpCodeModel.findOne({
      code: otpCode,
      email,
    });

    if (!existingOTP) return handleResponse(res, 'OTP code is invalid', 401);

    if (existingOTP.expiresAt < new Date())
      return handleResponse(res, 'OTP has expired', 401);

    const existingUser = await UserModel.findOne({
      email: existingOTP.email,
    });

    if (!existingUser) return handleResponse(res, 'User does not exist', 401);

    const existingUserAccess = await UserAccessModel.findOne({
      User: existingUser._id,
    });

    if (!existingUserAccess) return handleResponse(res, 'invalid request', 401);

    // existingUserAccess.password = password;
    existingUserAccess.updatePassword(password);

    await existingUserAccess.save();

    return handleResponse(res, 'Password reset successful, kindly login.', 201);
  } catch (err) {
    handleResponse(res, useWord('internalServerError', req.lang), 501, err);
  }
};

export default doResetPassword;
