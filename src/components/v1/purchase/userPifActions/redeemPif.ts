import { Response } from 'express';
import mongoose, { Document } from 'mongoose';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { sendOtpToSenderIfNotConfirmed } from '../../auth/authUtils';
import sortFinalSettlement from '../../transaction/transactionUtils/sortFinalSettlement';
import { UserAttributes } from '../../user/user.types';
import PurchaseModel from '../purchase.model';

export const redeemPif = async (req: IRequest, res: Response) => {
  const { purchaseId } = req.params;
  const { user, pifId } = req;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!user.isConfirmed) {
      sendOtpToSenderIfNotConfirmed(user as UserAttributes & Document, session);

      await session.commitTransaction();
      session.endSession();

      return handleResponse(res, {
        message: 'Please confirm your phone number',
        data: { otpRequired: true },
      });
    }

    const purchase = await PurchaseModel.findById(purchaseId);

    if (!purchase) {
      await session.abortTransaction();
      session.endSession();

      return handleResponse(res, 'Purchase not found', 404);
    }

    if (
      purchase.Receiver !== req.user._id &&
      (user.contact.phone !== purchase.recipientPhoneNumber ||
        user.contact.phonePrefix !== purchase.recipientPhonePrefix) &&
      purchase.recipientPifId !== pifId
    ) {
      await session.abortTransaction();
      session.endSession();

      return handleResponse(
        res,
        'You are not authorized to redeem this PIF',
        401
      );
    }

    if (purchase.redeemedAt) {
      await session.abortTransaction();
      session.endSession();

      return handleResponse(res, 'PIF already redeemed', 400);
    }

    if (!purchase.Receiver) purchase.Receiver = req.user._id;
    if (!purchase.recipientPifId) purchase.recipientPifId = req.pifId;

    purchase.redeemedAt = new Date();

    await purchase.save({ session });

    await sortFinalSettlement(purchase.SettlementFinish, session);

    await session.commitTransaction();
    session.endSession();

    return handleResponse(res, {
      message: 'PIF redeemed successfully',
      data: {
        redeemCode: purchase.code || '',
      },
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    handleResponse(res, 'An error occurred while redeeming PIF', 500, err);
  }
};
