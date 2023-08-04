import crypto from 'crypto';

import axios from 'axios';
import { Request, Response } from 'express';

import completeTransactionFromPayment from '../../components/v1/transaction/transactionUtils/completeTransactionFromPayment';
import appConfig from '../../config';
import { consoleLog, handleResponse } from '../../utils/helpers';

import {
  CreateTransferRecipientType,
  InitiatePaymentReturnType,
  ListBankDataProps,
  ResolveAcctNoProps,
  VerifyPaymentReturnType,
} from './paymentprocessors.types';

const PaystackService = (() => {
  const authHeader = {
    headers: {
      Authorization: `Bearer ${appConfig.paystackSecretKey}`,
    },
  };

  class _PaystackService {
    static async createPaymentLink(
      amount: number,
      email: string,
      currency: string,
      reference: string
    ): InitiatePaymentReturnType {
      try {
        const response = await axios.post(
          'https://api.paystack.co/transaction/initialize',
          {
            amount,
            email,
            currency,
            reference,
          },
          authHeader
        );
        const { data, status } = response.data;

        if (status) {
          return {
            paymentLink: data.authorization_url,
            paymentId: data.reference,
            driverReference: data.reference,
          };
        } else {
          return { errorMessage: data.message };
        }
      } catch (error) {
        throw { errorMessage: error.message || 'An error occurred' };
      }
    }

    static async verifyPayment(reference: string): VerifyPaymentReturnType {
      try {
        const { data } = await axios.get(
          `https://api.paystack.co/transaction/verify/${reference}`,
          authHeader
        );

        const { status, message, data: responseData } = data;

        if (!status || responseData.status !== 'success') {
          return {
            success: false,
            errorMessage: responseData.gateway_response || message,
          };
        }

        return {
          success: true,
          grossAmount: responseData.amount / 100,
          txFee: responseData.fees / 100,
          netAmount: responseData.amount / 100 - responseData.fees / 100,
          receiptUrl: responseData.receipt_url,
          chargeCurrency: responseData.currency,
        };
      } catch (error) {
        return {
          success: false,
          errorMessage: error.message || 'error fetching paystack data',
        };
      }
    }

    static async listBanks(): Promise<ListBankDataProps> {
      try {
        const response = await axios.get(
          'https://api.paystack.co/bank?currency=NGN',
          authHeader
        );
        return response.data;
      } catch (error) {
        throw error;
      }
    }

    static async resolveAccountNumber(
      bankCode: string,
      accountNumber: string
    ): Promise<ResolveAcctNoProps> {
      try {
        const response = await axios.get(
          'https://api.paystack.co/bank/resolve',
          {
            ...authHeader,
            params: {
              account_number: accountNumber,
              bank_code: bankCode,
            },
          }
        );
        return response.data;
      } catch (error) {
        throw error;
      }
    }

    static async createTransferRecipient(
      bankCode: string,
      accountNumber: string,
      accountName: string
    ): Promise<CreateTransferRecipientType> {
      try {
        const response = await axios.post(
          'https://api.paystack.co/transferrecipient',
          {
            type: 'nuban',
            name: accountName,
            account_number: accountNumber,
            bank_code: bankCode,
            currency: 'NGN',
          },
          authHeader
        );
        return response.data;
      } catch (error) {
        throw error;
      }
    }

    static verifyEventWebhook = (
      signature: string,
      body: string,
      sourceIpAddress: string
    ): boolean => {
      const hash = crypto
        .createHmac('sha512', appConfig.paystackSecretKey)
        .update(JSON.stringify(body))
        .digest('hex');

      const paystackIpAddresses = [
        '52.31.139.75',
        '52.49.173.169',
        '52.214.14.220',
      ];

      return (
        hash === signature && paystackIpAddresses.includes(sourceIpAddress)
      );
    };

    static paystackWebhook = async (req: Request, res: Response) => {
      const { body, headers } = req;

      let signature = headers['x-paystack-signature'];
      if (Array.isArray(signature)) {
        signature = signature[0];
      }
      const sourceIpAddress = headers['x-forwarded-for'];

      const isEventVerified = this.verifyEventWebhook(
        signature,
        body,
        sourceIpAddress as string
      );

      if (!isEventVerified) {
        return handleResponse(
          res,
          'Webhook signature verification failed',
          400
        );
      }

      const { event, data } = body;

      switch (event) {
        case 'charge.success':
          await completeTransactionFromPayment(
            'paystack',
            data.reference,
            data
          );
          break;
        case 'transfer.success':
          consoleLog('transfer.success', 'info');
          consoleLog(JSON.stringify(data, null, 2), 'info');
          break;
        case 'transfer.failed':
          consoleLog('transfer.failed', 'info');
          consoleLog(JSON.stringify(data, null, 2), 'info');
          break;
        case 'transfer.reversed':
          consoleLog('transfer.reversed', 'info');
          consoleLog(JSON.stringify(data, null, 2), 'info');
          break;
        default:
          consoleLog('default', 'info');
          consoleLog(JSON.stringify(data, null, 2), 'info');
          break;
      }

      handleResponse(res, 'Webhook received', 200);
    };
  }

  return _PaystackService;
})();

export default PaystackService;
