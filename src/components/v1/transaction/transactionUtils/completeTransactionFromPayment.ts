import { Document } from 'mongoose';

import { consoleLog } from '../../../../utils/helpers';
import { PaymentDriverType } from '../../platform/platform.types';
import { UserModel } from '../../user/user.model';
import { UserAttributes } from '../../user/user.types';
import { PaymentRecordModel } from '../transaction.model';

import completeTransaction from './completeTransaction';

const completeTransactionFromPayment = async (
  driver: PaymentDriverType,
  reference: string,
  paymentStatus: any
) => {
  try {
    const paymentRecord = await PaymentRecordModel.findOne({
      driver,
      reference: reference,
    });

    if (!paymentRecord) {
      consoleLog(`Payment record (${reference}) not found`);
      return;
    }

    if (paymentRecord.isOrderProcessed) {
      consoleLog(`Payment record (${reference}) already processed`);
      return;
    }

    paymentRecord.history.push({
      event: `${driver}-payment-verified`,
      data: paymentStatus.receiptUrl || paymentRecord.driverRefernce,
      happenedAt: new Date(),
    });

    await paymentRecord.save();

    const user = await UserModel.findById(paymentRecord.User);

    if (!paymentRecord) {
      consoleLog(`Error locating user for Payment record: (${reference})`);
      return;
    }

    await completeTransaction(
      user as UserAttributes & Document,
      paymentRecord,
      paymentStatus
    );
  } catch (error) {
    throw { errorMessage: error.message || 'An error occurred' };
  }
};

export default completeTransactionFromPayment;
