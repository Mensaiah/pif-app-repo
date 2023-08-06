import { Response } from 'express';
import ms from 'ms';
import { z } from 'zod';

import appConfig from '../../../../config';
import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { useWord } from '../../../../utils/wordSheet';
import PurchaseModel from '../../purchase/purchase.model';
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
      isConfirmed: true,
    });

    if (existingUser)
      return handleResponse(res, 'Account exists, please Login instead', 409);

    const haveReceivedPifBefore = await PurchaseModel.findOne({
      recipientPhonePrefix: phonePrefix,
      recipientPhoneNumber: phone,
    });

    const newUser = await new UserModel({
      contact: {
        phone,
        phonePrefix,
      },
      currentMarketplace: marketplace,
      userType: 'customer',
      shouldEnforceConfirmation: !!haveReceivedPifBefore,
    }).save();

    if (!newUser.shouldEnforceConfirmation) {
      const referenceCode = `${generateRandomCode(2)}${
        newUser._id
      }${generateRandomCode(5)}`;

      return handleResponse(
        res,
        {
          message: 'Account created successfully, proceed to next step',
          referenceCode,
        },
        201
      );
    }

    const newOtpCode = await new OtpCodeModel({
      User: newUser._id,
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
