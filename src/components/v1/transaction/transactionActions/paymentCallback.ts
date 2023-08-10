import { Response, Request } from 'express';
import mongoose, { Document } from 'mongoose';

import platformConstants from '../../../../config/platformConstants';
import { verifyPayment } from '../../../../services/paymentProcessors';
import paymentFailedTemplate from '../../../../templates/paymentFailed';
import paymentSuccessTemplate from '../../../../templates/paymentSuccess';
import { handleReqSearch } from '../../../../utils/queryHelpers';
import { PaymentDriverType } from '../../platform/platform.types';
import { UserModel } from '../../user/user.model';
import { UserAttributes } from '../../user/user.types';
import { PaymentRecordModel } from '../transaction.model';
import { PaymentRecordAttributes } from '../transaction.types';
import completeTransaction from '../transactionUtils/completeTransaction';

const paymentCallbackHandler = async (req: Request, res: Response) => {
  const { driver } = req.params;
  const { reference } = handleReqSearch(req, { reference: 'string' });
  const session = await mongoose.startSession();
  session.startTransaction();

  if (!reference) {
    await session.abortTransaction();
    session.endSession();

    return res.send(paymentFailedTemplate);
  }

  if (!platformConstants.paymentProcessors.includes(driver as any)) {
    await session.abortTransaction();
    session.endSession();

    return res.send(paymentFailedTemplate);
  }

  try {
    let paymentRecord: undefined | (Document & PaymentRecordAttributes);

    let paymentStatus = await verifyPayment(
      driver as PaymentDriverType,
      reference
    );

    if (!paymentStatus.success) {
      // check if the payment record is saved with the payment link
      paymentRecord = await PaymentRecordModel.findOne({
        driver,
        $or: [{ driverRefernce: reference }, { paymentLinkOrId: reference }],
      });

      if (!paymentRecord) {
        await session.abortTransaction();
        session.endSession();

        return res.send(paymentFailedTemplate);
      }
      if (paymentRecord.status !== 'successful') {
        paymentStatus = await verifyPayment(
          driver as PaymentDriverType,
          paymentRecord.driverRefernce
        );

        if (!paymentStatus.success) {
          await session.abortTransaction();
          session.endSession();

          return res.send(paymentFailedTemplate);
        }
      }
    }

    if (!paymentRecord) {
      paymentRecord = await PaymentRecordModel.findOne({
        driver,
        driverRefernce: reference,
      }).session(session);
    }

    if (!paymentRecord) {
      await session.abortTransaction();
      session.endSession();

      return res.send(paymentFailedTemplate);
    }
    if (paymentRecord.isOrderProcessed) {
      await session.abortTransaction();
      session.endSession();

      return res.send(paymentSuccessTemplate);
    }

    paymentRecord.status = 'successful';

    paymentRecord.history.push({
      event: `${driver}-payment-verified`,
      data: paymentStatus.receiptUrl || paymentRecord.driverRefernce,
      happenedAt: new Date(),
    });

    await paymentRecord.save({ session });

    const user = await UserModel.findById(paymentRecord.User).session(session);

    await completeTransaction(
      user as UserAttributes & Document,
      paymentRecord,
      paymentStatus,
      session
    );

    await session.commitTransaction();
    session.endSession();

    res.send(paymentSuccessTemplate);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    res.send(paymentFailedTemplate);
  }
};

export default paymentCallbackHandler;
