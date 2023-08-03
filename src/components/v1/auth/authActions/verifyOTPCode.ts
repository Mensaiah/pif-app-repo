import { Response } from 'express';
import { z } from 'zod';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { UserModel } from '../../user/user.model';
import { OtpCodeModel } from '../auth.models';
import { verifyOTPSchema } from '../auth.policy';

const verifyOTPCode = async (req: IRequest, res: Response) => {
  type verifyDataType = z.infer<typeof verifyOTPSchema>;

  const { phone, phonePrefix, code, email, purpose }: verifyDataType = req.body;

  try {
    const existingUser = await UserModel.findOne({
      ...(purpose === 'confirm-account' && {
        email,
      }),
      ...(phonePrefix &&
        phone && {
          userType: 'customer',
          'contact.phone': phone,
          'contact.phonePrefix': phonePrefix,
        }),
      ...(email && { email: email }),
    });

    if (!existingUser)
      return handleResponse(res, 'Account does not exist', 401);

    const otpExists = await OtpCodeModel.findOne(
      phonePrefix && phone
        ? {
            code,
            purpose,
            phone,
            phonePrefix,
            isDeleted: { $ne: true },
          }
        : {
            code,
            email,
            purpose,
            isDeleted: { $ne: true },
          }
    );

    if (!otpExists) return handleResponse(res, 'OTP code is invalid', 401);

    if (otpExists.expiresAt < new Date()) {
      return handleResponse(res, 'OTP has expired', 401);
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
export default verifyOTPCode;
