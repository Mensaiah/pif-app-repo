import { Document } from 'mongoose';

import StripeService from '../../../services/paymentProcessors/stripe.service';
import { IRequest } from '../../../types/global';
import { consoleLog } from '../../../utils/helpers';
import PlatformModel from '../platform/platform.model';
import { isStripeSupportedInMarketplace } from '../platform/platform.utils';

import { UserAttributes } from './user.types';

export const createInviteLink = (req: IRequest, code: string) =>
  `${req.protocol}://${
    req.protocol === 'http' ? 'localhost:5173' : 'pif-dashboard.web.app'
  }${req.baseUrl.replace(
    /users|partners/g,
    'auth'
  )}/invitation/${code}`.replace('/v1/en', '');

export const linkUserToStripe = async (user: UserAttributes & Document) => {
  try {
    const isStripeSupported = await isStripeSupportedInMarketplace(
      user.currentMarketplace
    );

    if (isStripeSupported) {
      const [isUserTiedToStripe, customerStripeData] =
        await StripeService.doesCustomerExist(user.email);

      if (isUserTiedToStripe && customerStripeData) {
        if (!user.paymentConfigs.stripeCustomerId) {
          user.paymentConfigs.stripeCustomerId = customerStripeData.id;
        }
      } else {
        const { id: stripeCustomerId } = await StripeService.createCustomer(
          user.email,
          user.name,
          user.contact.phonePrefix + user.contact.phone
        );
        user.paymentConfigs.stripeCustomerId = stripeCustomerId;
      }
    }
  } catch (err) {
    consoleLog('Error linking Customer to Stripe: ' + err, 'error');
  }
};
