import Currency from 'currency.js';
import { ObjectId } from 'mongoose';

import SettlementModel from '../../settlement/settlement.model';
import WalletModel from '../../wallet/wallet.model';

export default async function sortFinalSettlement(settlementId: ObjectId) {
  try {
    const settlement = await SettlementModel.findById(settlementId);

    if (!settlement) throw new Error('Settlement not found');

    const partnerWallet = await WalletModel.findOne({
      Partner: settlement.Partner,
      marketplace: settlement.marketplace,
      walletType: 'partner',
    });

    if (!partnerWallet) throw new Error('Partner wallet not found');

    const platformWallet = await WalletModel.findOne({
      Partner: { $exists: false },
      User: { $exists: false },
      marketplace: settlement.marketplace,
      walletType: 'system',
    });

    if (!platformWallet) throw new Error('Platform wallet not found');

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
      settlement.save(),
      partnerWallet.save(),
      platformWallet.save(),
    ]);
  } catch (err) {
    throw new Error(err);
  }
}
