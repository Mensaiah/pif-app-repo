import { Response } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { UserModel } from '../../user/user.model';
import { softDeleteUser } from '../../user/user.utils';
import { OtpCodeModel } from '../auth.models';
import { verifyOTPSchema } from '../auth.policy';

const verifyOTPCode = async (req: IRequest, res: Response) => {
  type verifyDataType = z.infer<typeof verifyOTPSchema>;

  const { phone, phonePrefix, code, email, purpose }: verifyDataType = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const otpExists = await OtpCodeModel.findOne({
      code,
      purpose,
      $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }],
    }).session(session);

    if (!otpExists) {
      await session.abortTransaction();
      session.endSession();

      return handleResponse(res, 'OTP code is invalid', 401);
    }

    const otpUser = await UserModel.findById(otpExists.User).session(session);

    if (!otpUser) {
      await session.abortTransaction();
      session.endSession();

      return handleResponse(res, 'OTP code could not be validated', 401);
    }

    const existingUser = await UserModel.findOne({
      ...(phonePrefix &&
        phone && {
          userType: 'customer',
          'contact.phone': phone,
          'contact.phonePrefix': phonePrefix,
        }),
      ...(email && { email }),
    }).session(session);

    if (!existingUser) {
      await session.abortTransaction();
      session.endSession();

      return handleResponse(res, 'Account does not exist', 401);
    }

    if (existingUser._id.toString() !== otpUser._id.toString()) {
      await session.abortTransaction();
      session.endSession();

      return handleResponse(res, 'OTP code could not be validated', 401);
    }

    if (otpExists.expiresAt < new Date()) {
      await session.abortTransaction();
      session.endSession();

      return handleResponse(res, 'OTP has expired', 401);
    }

    if (['confirm-account', 'signup'].includes(purpose)) {
      existingUser.isConfirmed = true;
      otpExists.isConfirmed = true;
      otpExists.isDeleted = true;
    }

    // delete all unconfirmed accounts with the same phone number
    if (['confirm-account', 'signup'].includes(purpose)) {
      const counterFeitAccounts = await UserModel.find({
        _id: { $ne: otpUser._id },
        'contact.phone': phone,
        'contact.phonePrefix': phonePrefix,
        userType: 'customer',
        $or: [{ isConfirmed: false }, { isConfirmed: { $exists: false } }],
      }).session(session);

      await Promise.all(counterFeitAccounts.map(softDeleteUser));
    }

    await otpExists.save({ session });
    if (existingUser.isModified()) await existingUser.save({ session });

    await session.commitTransaction();
    session.endSession();

    return handleResponse(res, 'Verification successful');
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    handleResponse(res, useWord('internalServerError', req.lang), 500, err);
  }
};
export default verifyOTPCode;
