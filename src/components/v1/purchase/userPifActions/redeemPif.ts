import { Response } from 'express';
import { Document } from 'mongoose';

import { IRequest } from '../../../../types/global';
import { consoleLog, handleResponse } from '../../../../utils/helpers';
import { OtpCodeModel } from '../../auth/auth.models';
import {
  generateRandomCode,
  sendOTP,
  sendOtpToSenderIfNotConfirmed,
} from '../../auth/authUtils';
import sortFinalSettlement from '../../transaction/transactionUtils/sortFinalSettlement';
import { UserModel } from '../../user/user.model';
import { UserAttributes } from '../../user/user.types';
import PurchaseModel from '../purchase.model';

export const redeemPif = async (req: IRequest, res: Response) => {
  const { purchaseId } = req.params;
  const { user, pifId } = req;

  try {
    if (!user.isConfirmed) {
      sendOtpToSenderIfNotConfirmed(user as UserAttributes & Document);

      return handleResponse(res, {
        message: 'Please confirm your phone number',
        data: { otpRequired: true },
      });
    }

    const purchase = await PurchaseModel.findById(purchaseId);

    if (!purchase) {
      return handleResponse(res, 'Purchase not found', 404);
    }

    if (
      purchase.Receiver !== req.user._id &&
      (user.contact.phone !== purchase.recipientPhoneNumber ||
        user.contact.phonePrefix !== purchase.recipientPhonePrefix) &&
      purchase.recipientPifId !== pifId
    ) {
      return handleResponse(
        res,
        'You are not authorized to redeem this PIF',
        401
      );
    }

    if (purchase.redeemedAt) {
      return handleResponse(res, 'PIF already redeemed', 400);
    }

    if (!purchase.Receiver) purchase.Receiver = req.user._id;
    if (!purchase.recipientPifId) purchase.recipientPifId = req.pifId;

    purchase.redeemedAt = new Date();

    await purchase.save();

    await sortFinalSettlement(purchase.SettlementFinish);

    return handleResponse(res, {
      message: 'PIF redeemed successfully',
      data: {
        redeemCode: purchase.code || '',
      },
    });
  } catch (err) {
    handleResponse(res, 'An error occurred while redeeming PIF', 500, err);
  }
};
