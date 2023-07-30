import { Response } from 'express';
import ms from 'ms';
import { z } from 'zod';

import appConfig from '../../../../config';
import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import { UserModel } from '../../user/user.model';
import { OtpCodeModel } from '../auth.models';
import { mobileSignupSchema } from '../auth.policy';
import { generateRandomCode, sendOTP, verifyCaptcha } from '../auth.utils';

import '../../../../services/infobip.service';

const doMobileSignup = async (req: IRequest, res: Response) => {
  type signUpDatatype = z.infer<typeof mobileSignupSchema>;

  const { phone, phonePrefix, marketplace, captchaToken }: signUpDatatype =
    req.body;

  try {
    const isCaptchaValid = await verifyCaptcha(captchaToken);
    if (!isCaptchaValid && !appConfig.isDev)
      return handleResponse(res, 'Invalid captcha', 400);

    const existingUser = await UserModel.findOne({
      userType: 'customer',
      'contact.phone': phone,
      'contact.phonePrefix': phonePrefix,
    });

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
