import { Response, Request } from 'express';
import { Document } from 'mongoose';

import platformConstants from '../../../../config/platformConstants';
import { verifyPayment } from '../../../../services/paymentProcessors';
import paymentFailedTemplate from '../../../../templates/paymentFailed';
import paymentSuccessTemplate from '../../../../templates/paymentSuccess';
import { consoleLog } from '../../../../utils/helpers';
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

  if (!reference) return res.send(paymentFailedTemplate);

  if (!platformConstants.paymentProcessors.includes(driver as any)) {
    return res.send(paymentFailedTemplate);
  }

  try {
    let paymentRecord: undefined | (Document & PaymentRecordAttributes);

    let paymentStatus = await verifyPayment(
      driver as PaymentDriverType,
      reference
    );
    consoleLog('first check: ' + JSON.stringify({ paymentStatus }, null, 2));

    if (!paymentStatus.success) {
      // check if the payment record is saved with the payment link
      paymentRecord = await PaymentRecordModel.findOne({
        driver,
        $or: [{ driverRefernce: reference }, { paymentLinkOrId: reference }],
      });
      consoleLog('second check: ' + JSON.stringify({ paymentRecord }, null, 2));
      if (!paymentRecord) return res.send(paymentFailedTemplate);
      if (paymentRecord.status !== 'successful') {
        paymentStatus = await verifyPayment(
          driver as PaymentDriverType,
          paymentRecord.driverRefernce
        );
        consoleLog(
          'third check: ' + JSON.stringify({ paymentStatus }, null, 2)
        );

        if (!paymentStatus.success) return res.send(paymentFailedTemplate);
      }
    }

    if (!paymentRecord) {
      paymentRecord = await PaymentRecordModel.findOne({
        driver,
        driverRefernce: reference,
      });
    }

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
    res.send(paymentFailedTemplate);
  }
};

export default paymentCallbackHandler;
