import { Response } from 'express';
import { z } from 'zod';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { UserModel } from '../../user/user.model';
import { OtpCodeModel, UserAccessModel } from '../auth.models';
import { forgotPasswordSchema } from '../auth.policy';
import { generateRandomCode, sendForgotPasswordCodeMail } from '../auth.utils';

const doForgotPassword = async (req: IRequest, res: Response) => {
  type forgetPasswordDataType = z.infer<typeof forgotPasswordSchema>;

  const { email }: forgetPasswordDataType = req.body;

  try {
    const existingUser = await UserModel.findOne({
      email,
      userType: {
        $ne: 'customer',
      },
    });

    if (!existingUser)
      return handleResponse(res, 'Account does not exist', 401);

    const existingUserAccess = await UserAccessModel.findOne({
      User: existingUser._id,
    });

    if (!existingUserAccess) return handleResponse(res, 'Invalid request', 401);

    if (existingUserAccess.isBlocked)
      return handleResponse(
        res,
        'Your account has been block. Contact PIF for assistance',
        401
      );

    const newOtpCode = await new OtpCodeModel({
      User: existingUser._id,
      code: generateRandomCode(),
      purpose: 'password-reset',
      email,
      lastSent: new Date(),
    }).save();

    await sendForgotPasswordCodeMail({ to: email, code: newOtpCode.code });

    return handleResponse(
      res,
      'Please check your mail for a verification code'
    );
  } catch (err) {
    handleResponse(res, useWord('internalServerError', req.lang), 501, err);
  }
};

export default doForgotPassword;
