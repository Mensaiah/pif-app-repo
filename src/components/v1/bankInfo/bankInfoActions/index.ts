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
import { getPartnerId } from '../bankInfo.utils';

export const resolveAccountNumber = async (req: IRequest, res: Response) => {
  type dataType = z.infer<typeof resolveBankAccountSchema>;

  const { accountNumber, bankCode, marketplace }: dataType = req.body;

  if (marketplace !== 'ng') {
    return handleResponse(res, 'marketplace not supported', 400);
  }

  const { success, message, status } = await getPartnerId(req);

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

  try {
    const { success, message, partnerId, status } = await getPartnerId(req);

    if (!success) return handleResponse(res, message, status);

    if (marketplace !== 'ng') {
      return handleResponse(res, 'marketplace not supported', 400);
    }

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

    const {
      status: accountInfoStatus,
      message: accountInfoMessage,
      data,
    } = accountInfo;

    if (!accountInfoStatus) {
      return handleResponse(res, accountInfoMessage, 400);
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
  try {
    const { success, message, partnerId, status } = await getPartnerId(req);
    const { status: accountStatus } = handleReqSearch(req, {
      status: 'string',
    });

    if (
      accountStatus &&
      !['enabled', 'disabled', 'all'].includes(accountStatus)
    ) {
      return handleResponse(res, 'status can be enabled, disabled or all', 400);
    }

    if (!success) return handleResponse(res, message, status);

    const bankAccounts = await BankInfoModel.find({
      Partner: partnerId,
      ...(accountStatus && accountStatus === 'enabled'
        ? { isDisabled: false }
        : accountStatus === 'disabled'
        ? { isDisabled: true }
        : {}),
    });

    return handleResponse(res, { data: bankAccounts });
  } catch (err) {
    handleResponse(res, 'error listing bank accounts', 500, err);
  }
};

export const disableBankAccount = async (req: IRequest, res: Response) => {
  const { bankAccountId } = req.params;

  try {
    const { success, message, status, partnerId } = await getPartnerId(req);

    if (!success) return handleResponse(res, message, status);

    const bankAccount = await BankInfoModel.findById(bankAccountId);

    if (!bankAccount) {
      return handleResponse(res, 'bank account not found', 404);
    }

    if (bankAccount.Partner.toString() !== partnerId.toString()) {
      return handleResponse(res, 'forbidden', 403);
    }

    if (!bankAccount.isDisabled) {
      bankAccount.isDisabled = true;

      await bankAccount.save();
    }

    return handleResponse(res, { data: bankAccount });
  } catch (err) {
    handleResponse(res, 'error disabling bank account', 500, err);
  }
};

export const enableBankAccount = async (req: IRequest, res: Response) => {
  const { bankAccountId } = req.params;

  try {
    const { success, message, status, partnerId } = await getPartnerId(req);

    if (!success) return handleResponse(res, message, status);

    const bankAccount = await BankInfoModel.findById(bankAccountId);

    if (!bankAccount) {
      return handleResponse(res, 'bank account not found', 404);
    }

    if (bankAccount.Partner.toString() !== partnerId.toString()) {
      return handleResponse(res, 'forbidden', 403);
    }

    if (bankAccount.isDisabled) {
      bankAccount.isDisabled = false;

      await bankAccount.save();
    }

    return handleResponse(res, { data: bankAccount });
  } catch (err) {
    handleResponse(res, 'error enabling bank account', 500, err);
  }
};
