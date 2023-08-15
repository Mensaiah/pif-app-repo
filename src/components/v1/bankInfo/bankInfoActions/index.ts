import { Response } from 'express';
import { ObjectId } from 'mongoose';
import { z } from 'zod';

import PaystackService from '../../../../services/paymentProcessors/paystack.service';
import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { handleReqSearch } from '../../../../utils/queryHelpers';
import { hasAccessToMarketplaces } from '../../../../utils/queryHelpers/helpers';
import { PartnerModel } from '../../partner/partner.model';
import BankInfoModel from '../bankInfo.model';
import {
  addBankAccountSchema,
  resolveBankAccountSchema,
} from '../bankInfo.policy';

const getPartnerId = async (
  req: IRequest
): Promise<{
  success: boolean;
  status?: number;
  message?: string;
  partnerId?: ObjectId;
}> => {
  const { user } = req;

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

  if (partnerId) {
    return { partnerId, success: true };
  }

  try {
    if (!req.isUserTopLevelAdmin) {
      const partner = await PartnerModel.findById(partner_id);
      if (!partner) {
        return {
          success: false,
          message: 'partner does not exist',
          status: 404,
        };
      }
      if (!hasAccessToMarketplaces(req, partner.marketplaces))
        return {
          success: false,
          message: 'forbidden',
          status: 403,
        };
    }

    return {
      partnerId: (partnerId || partner_id) as unknown as ObjectId,
      success: true,
    };
  } catch (err) {
    return {
      success: false,
      message: 'error validating request',
      status: 500,
    };
  }
};

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

    if (!success) return handleResponse(res, message, status);
    const bankAccounts = await BankInfoModel.find({
      Partner: partnerId,
    });

    return handleResponse(res, { data: bankAccounts });
  } catch (err) {
    handleResponse(res, 'error listing bank accounts', 500, err);
  }
};
