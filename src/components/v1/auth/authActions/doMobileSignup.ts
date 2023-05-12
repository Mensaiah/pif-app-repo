import { Response } from 'express';
import ms from 'ms';
import { z } from 'zod';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { UserModel } from '../../user/user.model';
import { OtpCodeModel } from '../auth.models';
import { mobileSignupSchema } from '../auth.policy';
import { generateRandomCode, sendOTP } from '../auth.utils';

import '../../../../services/infobipService';

const doMobileSignup = async (req: IRequest, res: Response) => {
  type signUpDatatype = z.infer<typeof mobileSignupSchema>;

  const { phone, phonePrefix, marketplace }: signUpDatatype = req.body;

  try {
    const existingUser = await UserModel.findOne({
      userType: 'customer',
      'contact.phone': phone,
      'contact.phonePrefix': phonePrefix,
    });
    if (existingUser) return handleResponse(res, 'Login instead, please', 409);

    await new UserModel({
      contact: {
        phone,
        phonePrefix,
      },
      currentMarketplace: marketplace,
      userType: 'customer',
    }).save();

    const newOtpCode = await new OtpCodeModel({
      code: generateRandomCode(),
      purpose: 'signup',
      expiresAt: new Date(Date.now() + ms('15 mins')),
      phone,
      phonePrefix,
      lastSent: new Date(),
    }).save();

    await sendOTP(phonePrefix + phone, newOtpCode.code);

    return handleResponse(res, 'Enter OTP to proceed');
  } catch (err) {
    handleResponse(res, useWord('internalServerError', req.lang), 500, err);
  }
};

export default doMobileSignup;
