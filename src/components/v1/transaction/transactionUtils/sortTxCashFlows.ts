import currency from 'currency.js';
import mongoose, { Document } from 'mongoose';

import { PartnerModel } from '../../partner/partner.model';
import { PurchaseAttributes } from '../../purchase/purchase.types';
import RevenueModel from '../../revenue/revenue.model';
import SettlementModel from '../../settlement/settlement.model';
import WalletModel from '../../wallet/wallet.model';
import { TransactionAttributes } from '../transaction.types';

const sortTxCashFlows = async (
  purchases: Array<PurchaseAttributes & Document>,
  tx: TransactionAttributes & Document,
  session: mongoose.ClientSession
) => {
  try {
    await Promise.all(
      purchases.map(async (purchase) => {
        // create settlement for start proportion and pif revenue
        const settlement = await new SettlementModel({
          amount: purchase.priceStart,
          currency: tx.currency,
          settlementType: 'start',
          Purchase: purchase._id,
          Product: purchase.Product,
          Partner: purchase.Partner,
          marketplace: purchase.marketplace,
          Transaction: tx._id,
        }).save({ session });

        const settlementEnd = await new SettlementModel({
          amount: purchase.priceFinish,
          currency: tx.currency,
          settlementType: 'end',
          Purchase: purchase._id,
          Product: purchase.Product,
          Partner: purchase.Partner,
          marketplace: purchase.marketplace,
          Transaction: tx._id,
          isSettled: false,
        }).save({ session });

        const pifIncome = await new RevenueModel({
          revenueFrom: 'pifProportion',
          amount: purchase.pifIncome,
          currency: tx.currency,
          marketplace: purchase.marketplace,
          Partner: purchase.Partner,
          Product: purchase.Product,
          User: purchase.User,
          Purchase: purchase._id,
          Transaction: tx._id,
        }).save({ session });

        purchase.SettlementStart = settlement._id;
        purchase.Revenue = pifIncome._id;
        purchase.SettlementFinish = settlementEnd._id;
        await purchase.save({ session });

        // create wallet for partner if it doesn't exist
        let partnerWallet = await WalletModel.findOne({
          Partner: purchase.Partner,
          currency: tx.currency,
          marketplace: purchase.marketplace,
        }).session(session);

        const partnerInfo = await PartnerModel.findById(
          purchase.Partner
        ).session(session);

        if (!partnerInfo) {
          throw new Error('Partner not found');
        }

        if (!partnerWallet) {
          partnerWallet = await new WalletModel({
            Partner: purchase.Partner,
            currency: tx.currency,
            marketplace: purchase.marketplace,
            amountThreshold: partnerInfo.settlingDetails?.amountThreshold || 0,
          }).save({ session });
        }

        partnerWallet.balance = currency(partnerWallet.balance).add(
          purchase.priceStart
        ).value;
        partnerWallet.amountOnHold = currency(partnerWallet.amountOnHold).add(
          purchase.priceFinish
        ).value;
        partnerWallet.totalIncome = currency(partnerWallet.totalIncome).add(
          purchase.priceStart
        ).value;

        // create platform wallet if it doesn't exist
        let platformWallet = await WalletModel.findOne({
          Partner: { $exists: false },
          User: { $exists: false },
          walletType: 'system',
          currency: tx.currency,
          marketplace: purchase.marketplace,
        }).session(session);

        if (!platformWallet) {
          platformWallet = await new WalletModel({
            walletType: 'system',
            currency: tx.currency,
            marketplace: purchase.marketplace,
          }).save({ session });
        }

        platformWallet.balance = currency(platformWallet.balance).add(
          purchase.pifIncome
        ).value;
        platformWallet.totalIncome = currency(platformWallet.totalIncome).add(
          purchase.pifIncome
        ).value;
        platformWallet.amountOnHold = currency(platformWallet.amountOnHold).add(
          purchase.priceFinish
        ).value;

        await Promise.all([
          partnerWallet.save({ session }),
          platformWallet.save({ session }),
        ]);
      })
    );
  } catch (error) {
    throw new Error(error);
  }
};

export default sortTxCashFlows;
