import { Response } from 'express';
import ms from 'ms';
import { z } from 'zod';

import { IRequest } from '../../../../types/global';
import { consoleLog, handleResponse } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { UserModel } from '../../user/user.model';
import { OtpCodeModel } from '../auth.models';
import { mobileSignupSchema } from '../auth.policy';
import { generateRandomCode, sendOTP } from '../auth.utils';

import '../../../../services/infobipService';

const doMobileSignup = async (req: IRequest, res: Response) => {
  type signUpDatatype = z.infer<typeof mobileSignupSchema>;

  const { phone, phonePrefix, marketplace }: signUpDatatype = req.body;
  consoleLog({ phone, phonePrefix, marketplace });

  try {
    const existingUser = await UserModel.findOne({
      userType: 'customer',
      'contact.phone': phone,
      'contact.phonePrefix': phonePrefix,
    });
    consoleLog({ existingUser });
    if (existingUser)
      return handleResponse(res, 'Account exists, please Login instead', 409);

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

    return handleResponse(res, 'Enter OTP to proceed', 201);
  } catch (err) {
    if (err.code === '11000')
      return handleResponse(res, 'Account exists, please Login instead', 409);

    handleResponse(res, useWord('internalServerError', req.lang), 500, err);
  }
};

export default doMobileSignup;
