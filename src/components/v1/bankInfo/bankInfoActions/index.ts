import { Response } from 'express';
import { z } from 'zod';

import PaystackService from '../../../../services/paymentProcessors/paystack.service';
import { IRequest } from '../../../../types/global';
import { consoleLog, handleResponse } from '../../../../utils/helpers';
import { handleReqSearch } from '../../../../utils/queryHelpers';
import BankInfoModel from '../bankInfo.model';
import {
  addBankAccountSchema,
  resolveBankAccountSchema,
} from '../bankInfo.policy';

export const resolveAccountNumber = async (req: IRequest, res: Response) => {
  type dataType = z.infer<typeof resolveBankAccountSchema>;

  const { accountNumber, bankCode, marketplace }: dataType = req.body;

  if (marketplace !== 'ng') {
    return handleResponse(res, 'marketplace not supported', 400);
  }

  const { user } = req;
  const { Partner: partnerId } = user;
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

  const { partner_id } = handleReqSearch(req, {
    partner_id: 'string',
  });

  if (marketplace !== 'ng') {
    return handleResponse(res, 'marketplace not supported', 400);
  }

  const { user, userType } = req;

  const { Partner: partnerId } = user;

  if (!partnerId && !partner_id) {
    return handleResponse(res, 'partner is required', 404);
  }

  // TODO: make checking strict
  if (userType === 'partner-admin') {
    if (partnerId.toString() !== partner_id.toString()) {
      return handleResponse(res, 'unauthorized', 401);
    }
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

    consoleLog(JSON.stringify(speicifiedBank, null, 2));

    const newBankAccount = await new BankInfoModel({
      Partner: partnerId || partner_id,
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
  const { user, userType } = req;

  const { partner_id } = handleReqSearch(req, {
    partner_id: 'string',
  });

  const { Partner: partnerId } = user;

  if (!partnerId && !partner_id) {
    return handleResponse(res, 'partner is required', 404);
  }

  // TODO: make checking strict
  if (userType === 'partner-admin') {
    if (partnerId.toString() !== partner_id.toString()) {
      return handleResponse(res, 'unauthorized', 401);
    }
  }

  try {
    const bankAccounts = await BankInfoModel.find({
      Partner: partnerId || partner_id,
    });

    return handleResponse(res, { data: bankAccounts });
  } catch (err) {
    handleResponse(res, 'error listing bank accounts', 500, err);
  }
};
