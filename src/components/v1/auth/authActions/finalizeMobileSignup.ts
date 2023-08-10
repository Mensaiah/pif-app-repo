import { Response } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';

import { IRequest } from '../../../../types/global';
import { handleResponse, uuid } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { UserModel } from '../../user/user.model';
import { OtpCodeModel, UserAccessModel } from '../auth.models';
import { finalizeMobileSignupSchema } from '../auth.policy';
import { UserSessionAttributes } from '../auth.types';
import { createNewSession, generateToken } from '../authUtils';

const finalizeSignup = async (req: IRequest, res: Response) => {
  type dataType = z.infer<typeof finalizeMobileSignupSchema>;
  const {
    name,
    dob,
    phone,
    phonePrefix,
    email,
    pifId,
    zipCode,
    otpCode,
    referenceCode,
  }: dataType = req.body;

  const refCode = referenceCode?.slice(2, -5);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingUser = refCode
      ? await UserModel.findById(refCode).session(session)
      : await UserModel.findOne({
          userType: 'customer',
          'contact.phone': phone,
          'contact.phonePrefix': phonePrefix,
        }).session(session);

    if (!existingUser) {
      await session.abortTransaction();
      session.endSession();

      return handleResponse(
        res,
        'Invalid operation. Please, let us know if you think this is an error',
        401
      );
    }

    const existingCustomerWithEmail = await UserModel.findOne({
      userType: 'customer',
      email,
    }).session(session);

    if (
      existingCustomerWithEmail &&
      existingCustomerWithEmail._id !== existingUser?._id
    ) {
      await session.abortTransaction();
      session.endSession();

      return handleResponse(res, 'Email already exists', 409);
    }

    const pifIdExists = await UserModel.countDocuments({
      pifId,
    }).session(session);

    if (pifIdExists > 0) {
      await session.abortTransaction();
      session.endSession();

      return handleResponse(res, 'PIF ID already exists', 409);
    }

    if (existingUser.shouldEnforceConfirmation && !existingUser.isConfirmed) {
      await session.abortTransaction();
      session.endSession();

      return handleResponse(res, 'You need to verify your OTP first', 401);
    }

    if (existingUser.isSignupComplete) {
      await session.abortTransaction();
      session.endSession();

      return handleResponse(
        res,
        'Signup has already been finalized. No changes were made'
      );
    }

    if (otpCode) {
      const otpExists = await OtpCodeModel.findOne({
        code: otpCode,
        purpose: 'signup',
        User: existingUser._id,
      }).session(session);

      if (!otpExists) {
        await session.abortTransaction();
        session.endSession();

        return handleResponse(res, 'OTP code is invalid', 401);
      }

      if (!otpExists.isConfirmed) {
        await session.abortTransaction();
        session.endSession();

        return handleResponse(res, 'Invalid credentials', 401);
      }

      otpExists.isDeleted = true;
      await otpExists.save({ session });
    }

    existingUser.name = name;
    existingUser.email = email;
    existingUser.dob = new Date(dob);
    existingUser.pifId = pifId;
    existingUser.contact.zip = zipCode;
    existingUser.isSignupComplete = true;
    await existingUser.save({ session });

    const now = new Date();
    const userAccess = new UserAccessModel({
      User: existingUser._id,
      securityCode: uuid(),
      lastLoginAt: now,
      lastEventTime: now,
      failedLoginAttempts: 0,
      role: 'customer',
      permissions: [],
    });

    const newSession: UserSessionAttributes = createNewSession(req);
    userAccess.sessions.push(newSession);
    await userAccess.save({ session });

    const token = generateToken({
      authKey: userAccess.securityCode,
      deviceId: req.fingerprint.hash,
      userType: existingUser.userType,
      sessionId: newSession.sessionId,
      ref: existingUser._id,
      role: userAccess.role,
    });
    // res.cookie('jwt', token, {
    //   httpOnly: true,
    //   secure: appConfig.isProd,
    //   sameSite: 'lax',
    //   maxAge: ms(appConfig.authConfigs.sessionLivespan),
    // });

    await session.commitTransaction();
    session.endSession();

    return handleResponse(res, {
      message: 'Please create your pin',
      data: {
        token,
        userData: {
          name: existingUser.name,
          pifId: existingUser.pifId,
          email: existingUser.email,
          avatar: existingUser.avatar,
          currentMarketplace: existingUser.currentMarketplace,
          phonePrefix: existingUser.contact.phonePrefix,
          phone: existingUser.contact.phone,
          shouldEnforceConfirmation: existingUser.shouldEnforceConfirmation,
          isConfirmed: existingUser.isConfirmed,
        },
      },
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    handleResponse(res, useWord('internalServerError', req.lang), 500, err);
  }
};
export default finalizeSignup;
