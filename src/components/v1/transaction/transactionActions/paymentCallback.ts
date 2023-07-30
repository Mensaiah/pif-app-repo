import { Response, Request } from 'express';
import { Document } from 'mongoose';

import platformConstants from '../../../../config/platformConstants';
import { verifyPayment } from '../../../../services/paymentProcessors';
import paymentFailedTemplate from '../../../../templates/paymentFailed';
import paymentSuccessTemplate from '../../../../templates/paymentSuccess';
import { consoleLog } from '../../../../utils/helpers';
import { PaymentDriverType } from '../../platform/platform.types';
import { UserModel } from '../../user/user.model';
import { UserAttributes } from '../../user/user.types';
import { PaymentRecordModel } from '../transaction.model';
import completeTransaction from '../transactionUtils/completeTransaction';

const paymentCallbackHandler = async (req: Request, res: Response) => {
  const { driver } = req.params;
  let { reference } = req.query;

  if (reference && Array.isArray(reference)) reference = reference[0];
  reference = reference.toString();

  if (typeof reference !== 'string') return res.send(paymentFailedTemplate);
  if (!platformConstants.paymentProcessors.includes(driver as any)) {
    return res.send(paymentFailedTemplate);
  }

  try {
    const paymentStatus = await verifyPayment(
      driver as PaymentDriverType,
      reference
    );

    if (!paymentStatus.success) return res.send(paymentFailedTemplate);

    const paymentRecord = await PaymentRecordModel.findOne({
      driver,
      driverRefernce: reference,
    });

    if (!paymentRecord) return res.send(paymentFailedTemplate);
    if (paymentRecord.isOrderProcessed) return res.send(paymentSuccessTemplate);

    paymentRecord.status = 'successful';

    paymentRecord.history.push({
      event: `${driver}-payment-verified`,
      data: paymentStatus.receiptUrl || paymentRecord.driverRefernce,
      happenedAt: new Date(),
    });

    await paymentRecord.save();

    const user = await UserModel.findById(paymentRecord.User);

    res.send(paymentSuccessTemplate);

    await completeTransaction(
      user as UserAttributes & Document,
      paymentRecord,
      paymentStatus
    );
  } catch (error) {
    consoleLog(error, 'error');
    res.send(paymentFailedTemplate);
  }
};

export default paymentCallbackHandler;
