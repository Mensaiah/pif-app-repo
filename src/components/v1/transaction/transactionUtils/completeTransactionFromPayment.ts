import mongoose, { Document } from 'mongoose';

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
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const paymentRecord = await PaymentRecordModel.findOne({
      driver,
      reference: reference,
    }).session(session);

    if (!paymentRecord) {
      await session.abortTransaction();
      session.endSession();

      consoleLog(`Payment record (${reference}) not found`);
      return;
    }

    if (paymentRecord.isOrderProcessed) {
      await session.abortTransaction();
      session.endSession();

      consoleLog(`Payment record (${reference}) already processed`);
      return;
    }

    paymentRecord.history.push({
      event: `${driver}-payment-verified`,
      data: paymentStatus.receiptUrl || paymentRecord.driverRefernce,
      happenedAt: new Date(),
    });

    await paymentRecord.save({ session });

    const user = await UserModel.findById(paymentRecord.User).session(session);

    if (!user) {
      await session.abortTransaction();
      session.endSession();

      consoleLog(`Error locating user for Payment record: (${reference})`);
      return;
    }

    await completeTransaction(
      user as UserAttributes & Document,
      paymentRecord,
      paymentStatus,
      session
    );

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    throw { errorMessage: error.message || 'An error occurred' };
  }
};

export default completeTransactionFromPayment;
