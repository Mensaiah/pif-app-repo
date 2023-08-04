import { Document } from 'mongoose';
import { Types } from 'mongoose';

import PlatformModel from '../../components/v1/platform/platform.model';
import { PaymentDriverType } from '../../components/v1/platform/platform.types';
import { UserAttributes } from '../../components/v1/user/user.types';
import { consoleLog } from '../../utils/helpers';

import {
  InitiatePaymentReturnType,
  VerifyPaymentReturnType,
} from './paymentprocessors.types';
import PaystackService from './paystack.service';
import StripeService from './stripe.service';

export const initiatePayment = async ({
  driver,
  amount,
  currency,
  idempotencyKey,
  user,
  refId,
  items,
  marketplace,
}: {
  driver: PaymentDriverType;
  amount: number;
  currency: string;
  idempotencyKey: string;
  user: UserAttributes & Document;
  refId: Types.ObjectId;
  items?: any[];
  marketplace: string;
}): InitiatePaymentReturnType => {
  const platform = await PlatformModel.findOne().sort({ createdAt: -1 });
  if (!platform)
    return { errorMessage: 'could not generate payment at this time' };

  if (
    !platform.marketplaces
      .find((m) => m.code === marketplace)
      ?.paymentProcessors.includes(driver)
  ) {
    return {
      errorMessage: 'Payment driver is either not yet supported or invalid',
    };
  }

  amount = amount * 100;

  switch (driver) {
    case 'paystack':
      return await PaystackService.createPaymentLink(
        amount,
        user.email,
        currency,
        refId.toString()
      );
    case 'stripe':
      return await StripeService.createPaymentIntent({
        amount,
        currency,
        customer: user.paymentConfigs.stripeCustomerId,
        description: 'Payment for PIF',
        recordId: refId.toString(),
      });
    // case 'nets':
    //   return await initiateNetsPayment({
    //     amount,
    //     currency,
    //     idempotencyKey,
    //     refId,
    //   });
    // case 'mobilePay':
    //   return await initiateMobilePayPayment({
    //     amount,
    //     currency,
    //     idempotencyKey,
    //     refId,
    //   });
    default:
      return {
        errorMessage:
          'Payment driver is either not yet supported in this marketplace or invalid',
      };
  }
};

export const verifyPayment = async (
  driver: PaymentDriverType,
  reference: string
): VerifyPaymentReturnType => {
  switch (driver) {
    case 'paystack':
      return await PaystackService.verifyPayment(reference);
    case 'stripe':
      return await StripeService.verifyPayment(reference);
    // case 'nets':
    //   return await verifyNetsPayment(reference);
    // case 'mobilePay':
    //   return await verifyMobilePayPayment(reference);
    default:
      return {
        success: false,
        errorMessage: 'Payment driver is either not yet supported or invalid',
      };
  }
};
