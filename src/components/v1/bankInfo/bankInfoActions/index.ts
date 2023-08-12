import { Response } from 'express';
import { z } from 'zod';

import PaystackService from '../../../../services/paymentProcessors/paystack.service';
import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { handleReqSearch } from '../../../../utils/queryHelpers';
import BankInfoModel from '../bankInfo.model';
import {
  addBankAccountSchema,
  resolveBankAccountSchema,
} from '../bankInfo.policy';

const getPartnerId = (req: IRequest) => {
  const { user, userType } = req;

  const { Partner: partnerId } = user;

  const { partner_id } = handleReqSearch(req, {
    partner_id: 'string',
  });

  if (!partnerId && !partner_id)
    return {
      success: false,
      message: 'partner is required',
      status: 400,
    };

  if (userType !== 'partner-admin') {
    if (partner_id && partner_id.toString() !== partnerId?.toString())
      return {
        success: false,
        message: 'unauthorized',
        status: 403,
      };
  }

  return { partnerId: partnerId || partner_id, success: true };
};

export const resolveAccountNumber = async (req: IRequest, res: Response) => {
  type dataType = z.infer<typeof resolveBankAccountSchema>;

  const { accountNumber, bankCode, marketplace }: dataType = req.body;

  if (marketplace !== 'ng') {
    return handleResponse(res, 'marketplace not supported', 400);
  }

  const { success, message, status } = getPartnerId(req);

  if (!success) return handleResponse(res, message, status);

  try {
    const accountInfo = await PaystackService.resolveAccountNumber(
      bankCode,
      accountNumber
    );

    const { status, message, data } = accountInfo;

    if (!status) {
      return handleResponse(res, message, 400);
    }

    return handleResponse(res, { data: data });
  } catch (err) {
    handleResponse(res, 'error resolving account number', 500, err);
  }
};

export const addBankAccount = async (req: IRequest, res: Response) => {
  type dataType = z.infer<typeof addBankAccountSchema>;

  const { accountNumber, bankCode, marketplace }: dataType = req.body;

  const { success, message, partnerId, status } = getPartnerId(req);

  if (!success) return handleResponse(res, message, status);

  if (marketplace !== 'ng') {
    return handleResponse(res, 'marketplace not supported', 400);
  }

  try {
    const accountInfo = await PaystackService.resolveAccountNumber(
      bankCode,
      accountNumber
    );
    const bankListData = await PaystackService.listBanks();

    if (!bankListData.status) {
      return handleResponse(res, bankListData.message, 400);
    }

    const speicifiedBank = bankListData.data.find(
      (bank) => bank.code === bankCode
    );

    if (!speicifiedBank) {
      return handleResponse(res, 'bank not found', 400);
    }

    const { status, message, data } = accountInfo;

    if (!status) {
      return handleResponse(res, message, 400);
    }

    const newBankAccount = await new BankInfoModel({
      Partner: partnerId,
      accountName: data.account_name,
      accountNumber: data.account_number,
      bankCode: bankCode,
      bankName: speicifiedBank?.name,
      country: speicifiedBank?.country,
      currency: speicifiedBank?.currency,
    }).save();

    return handleResponse(res, { data: newBankAccount });
  } catch (err) {
    handleResponse(res, 'error resolving account number', 500, err);
  }
};

export const listBankAccounts = async (req: IRequest, res: Response) => {
  const { success, message, partnerId, status } = getPartnerId(req);

  if (!success) return handleResponse(res, message, status);

  try {
    const bankAccounts = await BankInfoModel.find({
      Partner: partnerId,
    });

    return handleResponse(res, { data: bankAccounts });
  } catch (err) {
    handleResponse(res, 'error listing bank accounts', 500, err);
  }
};
