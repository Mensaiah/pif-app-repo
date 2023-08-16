import Currency from 'currency.js';
import mongoose, { ObjectId } from 'mongoose';

import { PartnerModel } from '../../partner/partner.model';
import SettlementModel from '../../settlement/settlement.model';
import WalletModel from '../../wallet/wallet.model';

export default async function sortFinalSettlement(
  settlementId: ObjectId,
  session: mongoose.ClientSession
) {
  try {
    const settlement = await SettlementModel.findById(settlementId).session(
      session
    );

    if (!settlement) {
      throw new Error('Settlement not found');
    }
    const partnerInfo = await PartnerModel.findById(settlement.Partner).session(
      session
    );
    if (!partnerInfo) {
      throw new Error('Partner not found');
    }

    const partnerWallet = await WalletModel.findOne({
      Partner: settlement.Partner,
      marketplace: settlement.marketplace,
      walletType: 'partner',
      amountThreshold: partnerInfo.settlingDetails?.amountThreshold || 0,
    }).session(session);

    if (!partnerWallet) {
      throw new Error('Partner wallet not found');
    }

    const platformWallet = await WalletModel.findOne({
      Partner: { $exists: false },
      User: { $exists: false },
      marketplace: settlement.marketplace,
      walletType: 'system',
    }).session(session);

    if (!platformWallet) {
      throw new Error('Platform wallet not found');
    }

    partnerWallet.balance = Currency(partnerWallet.balance).add(
      settlement.amount
    ).value;
    partnerWallet.amountOnHold = Currency(partnerWallet.amountOnHold).subtract(
      settlement.amount
    ).value;
    partnerWallet.totalIncome = Currency(partnerWallet.totalIncome).add(
      settlement.amount
    ).value;

    platformWallet.amountOnHold = Currency(
      platformWallet.amountOnHold
    ).subtract(settlement.amount).value;

    settlement.isSettled = true;

    await Promise.all([
      settlement.save({ session }),
      partnerWallet.save({ session }),
      platformWallet.save({ session }),
    ]);
  } catch (err) {
    throw new Error(err);
  }
}
