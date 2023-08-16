import Currency from 'currency.js';
import { Response } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { hasAccessToMarketplaces } from '../../../../utils/queryHelpers/helpers';
import PlatformModel from '../../platform/platform.model';
import PurchaseModel from '../../purchase/purchase.model';
import WalletModel from '../../wallet/wallet.model';
import { PartnerPayoutModel, PayoutModel } from '../payout.model';
import { generatePayoutSchema } from '../payout.policy';

export const generatePayout = async (req: IRequest, res: Response) => {
  const { marketplace, walletIds }: z.infer<typeof generatePayoutSchema> =
    req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (
      !hasAccessToMarketplaces(req, marketplace) ||
      req.userType !== 'platform-admin'
    ) {
      await session.abortTransaction();
      session.endSession();

      return handleResponse(
        res,
        'You do not have access to this marketplace',
        403
      );
    }

    let wallets = await Promise.all(
      walletIds.map((id) =>
        WalletModel.findOne({
          _id: id,
          marketplace,
        })
          .populate('Partner')
          .session(session)
      )
    );

    if (!wallets.length) {
      await session.abortTransaction();
      session.endSession();

      return handleResponse(res, 'operation failed', 400);
    }
    wallets = wallets.filter(
      (wallet) => Boolean(wallet) && wallet?.balance && wallet?.Partner
    );

    const totalAmount = wallets.reduce(
      (acc, curr) => Currency(acc).add(curr?.balance || 0).value,
      0
    );
    const platform = await PlatformModel.findOne()
      .sort({ createdAt: -1 })
      .session(session);

    if (!platform) {
      await session.abortTransaction();
      session.endSession();

      return handleResponse(res, 'operation failed', 400);
    }

    const payout = await new PayoutModel({
      amount: totalAmount,
      marketplace,
      currency: platform.marketplaces.find((m) => m.code === marketplace)
        ?.currencyCode,
      InitiatedBy: req.user._id,
    }).save({ session });

    // create partner payouts
    await Promise.all(
      wallets.map(async (wallet) => {
        try {
          const partnerPurchases = await PurchaseModel.find({
            Partner: wallet?.Partner?._id,
            $or: [
              { startSettlementPaidAt: { $exists: false } },
              { finishSettlementPaidAt: { $exists: false } },
            ],
          });

          const partnerPayoutItems = partnerPurchases.map((purchase) => ({
            Purchase: purchase._id,
            type: !purchase.redeemedAt
              ? 'start'
              : purchase.startSettlementPaidAt
              ? 'finish'
              : 'full',
          }));

          return new PartnerPayoutModel({
            Payout: payout._id,
            Partner: wallet?.Partner?._id,
            amount: wallet?.balance || 0,
            items: partnerPayoutItems,
          }).save({ session });
        } catch (err) {
          throw new Error(err);
        }
      })
    );

    await session.commitTransaction();
    session.endSession();

    handleResponse(res, {
      message: 'Payout generated successfully',
      data: {
        payout,
      },
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    handleResponse(res, 'Internal server error', 500, err);
  }
};
