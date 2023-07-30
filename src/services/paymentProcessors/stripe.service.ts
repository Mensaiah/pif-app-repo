import { stat } from 'fs';

import { ObjectId } from 'mongoose';
import Stripe from 'stripe';

import appConfig from '../../config';

import {
  InitiatePaymentReturnType,
  VerifyPaymentReturnType,
} from './paymentprocessors.types';

const SripeService = (() => {
  const stripe = new Stripe(appConfig.stripeSecretKey, {
    apiVersion: '2022-11-15',
  });

  class _StripeService {
    static getBalance = async () => {
      try {
        const balance = await stripe.balance.retrieve();
        return balance;
      } catch (err) {
        throw err;
      }
    };

    // A. Collect money from customers
    static createCustomer = async (
      email: string,
      name: string,
      mobile: string
    ) => {
      try {
        const customer = await stripe.customers.create({
          name,
          email,
          phone: mobile,
        });

        return customer;
      } catch (err) {
        throw err;
      }
    };

    static doesCustomerExist = async (
      email: string
    ): Promise<[boolean, any]> => {
      try {
        const customers = await stripe.customers.search({
          query: `email:'${email}'`,
        });

        return [customers.data.length > 0, customers.data[0]];
      } catch (err) {
        throw err;
      }
    };

    static createPaymentIntent = async ({
      currency = 'usd',
      amount,
      customer,
      description,
      recordId,
    }: {
      amount: number;
      currency: string;
      customer: string;
      description: string;
      recordId: string;
    }): InitiatePaymentReturnType => {
      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount,
          currency,
          customer,
          description,
          confirm: true,
          off_session: true,
          setup_future_usage: 'off_session',
          automatic_payment_methods: {
            enabled: true,
          },
          metadata: {
            recordId,
          },
          payment_method_options: {
            card: {
              setup_future_usage: 'off_session',
            },
          },
        });

        return { paymentId: paymentIntent.client_secret };
      } catch (err) {
        throw err;
      }
    };

    static verifyPayment = async (
      paymentId: string
    ): VerifyPaymentReturnType => {
      try {
        const charges = await stripe.charges.list({
          payment_intent: paymentId,
        });

        if (!charges.data.length) {
          return {
            success: false,
            errorMessage: 'No charges found',
          };
        }

        const charge = charges.data[0];

        const balanceTransactionId = charge.balance_transaction;
        const receiptUrl = charge.receipt_url;
        const paid = charge.paid;
        const status = charge.status;

        if (typeof balanceTransactionId !== 'string') {
          return {
            success: false,
            errorMessage: 'transaction could not be validated',
          };
        }

        const balanceTransaction = await stripe.balanceTransactions.retrieve(
          balanceTransactionId
        );

        return {
          success: status === 'succeeded' && paid,
          receiptUrl,
          grossAmount: balanceTransaction.amount / 100,
          txFee: balanceTransaction.fee / 100,
          netAmount: balanceTransaction.net / 100,
        };
      } catch (err) {
        return {
          success: false,
          errorMessage: err.message || 'error fetching stripe data',
        };
      }
    };
  }

  return _StripeService;
})();

export default SripeService;

/*
layout: {
  type: 'tabs',
  defaultCollapsed: false,
}
{
  "paymentIntent": {
    "id": "pi_3NUcrRKdtPrufmFP1EcNVQmM",
    "object": "payment_intent",
    "allowed_source_types": [
      "card"
    ],
    "amount": 50,
    "amount_details": {
      "tip": {}
    },
    "automatic_payment_methods": null,
    "canceled_at": null,
    "cancellation_reason": null,
    "capture_method": "automatic",
    "client_secret": "pi_3NUcrRKdtPrufmFP1EcNVQmM_secret_w7M6eopKJJztlhS0CCO65r6zd",
    "confirmation_method": "automatic",
    "created": 1689544333,
    "currency": "usd",
    "description": null,
    "last_payment_error": null,
    "livemode": false,
    "next_action": null,
    "next_source_action": null,
    "payment_method": "pm_1NUd1bKdtPrufmFPrEuMy6Gy",
    "payment_method_types": [
      "card"
    ],
    "processing": null,
    "receipt_email": null,
    "setup_future_usage": null,
    "shipping": null,
    "source": null,
    "status": "succeeded"
  }
}
*/
