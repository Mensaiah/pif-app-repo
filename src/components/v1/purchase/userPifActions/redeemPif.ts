import { Response } from 'express';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import sortFinalSettlement from '../../transaction/transactionUtils/sortFinalSettlement';
import PurchaseModel from '../purchase.model';

export const redeemPif = async (req: IRequest, res: Response) => {
  const { purchase_id } = req.params;
  const { user } = req;

  // if user.isConfirmed === false trigger OTP to all users with same number and return
  // if (!user.isConfirmed) {
  //  create a function that will get all users with same number and send OTP to them
  //   await sendOTP(user.contact.phone, user.contact.phonePrefix);
  //  return handleResponse(res, {
  //    message: 'Please confirm your phone number',
  //    data: { otpRequired: true },
  // });
  // }
  try {
    const purchase = await PurchaseModel.findById(purchase_id);

    if (
      !purchase.Receiver !== req.user._id &&
      user.contact.phone !== purchase.recipientPhoneNumber &&
      user.contact.phonePrefix !== purchase.recipientPhonePrefix
    ) {
      return handleResponse(
        res,
        'You are not authorized to redeem this PIF',
        401
      );
    }

    if (!purchase) {
      return handleResponse(res, 'Purchase not found', 404);
    }

    if (purchase.redeemedAt) {
      return handleResponse(res, 'PIF already redeemed', 400);
    }

    if (!purchase.Receiver) {
      purchase.Receiver = req.user._id;
    }

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
