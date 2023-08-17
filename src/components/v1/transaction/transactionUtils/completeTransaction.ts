import currency from 'currency.js';
import mongoose, { Document, ObjectId } from 'mongoose';
import ms from 'ms';

import platformConstants from '../../../../config/platformConstants';
import { VerifyPaymentReturnType } from '../../../../services/paymentProcessors/paymentprocessors.types';
import { isDate } from '../../../../utils/validators';
import { sendOtpToSenderIfNotConfirmed } from '../../auth/authUtils';
import DiscountCodeModel from '../../discountCode/discountCode.model';
import { sendPartnerOrderNotification } from '../../notification/notificationUtils';
import { PartnerModel } from '../../partner/partner.model';
import ProductModel from '../../product/product.model';
import PurchaseModel from '../../purchase/purchase.model';
import { UserModel } from '../../user/user.model';
import { UserAttributes } from '../../user/user.types';
import { TransactionModel } from '../transaction.model';
import { PaymentRecordAttributes } from '../transaction.types';

import sortTxCashFlows from './sortTxCashFlows';

type ResolvedReturnType<T> = T extends Promise<infer R> ? R : T;
type DriverPaymentDataType = ResolvedReturnType<VerifyPaymentReturnType>;

const completeTransaction = async (
  user: UserAttributes & Document,
  paymentRecord: PaymentRecordAttributes & Document,
  driverPaymentData: DriverPaymentDataType,
  session: mongoose.ClientSession
) => {
  if (paymentRecord.isOrderProcessed) {
    return { message: 'Order already processed' };
  }

  if (!driverPaymentData.success) {
    return { message: driverPaymentData.errorMessage };
  }

  // 1. update paymentRecord accordingly and create a transaction
  paymentRecord.status = 'successful';
  paymentRecord.txFee = driverPaymentData.txFee;

  try {
    let multipleReceivers = false;
    const receivers = await UserModel.find(
      {
        userType: 'customer',
        $or: [
          {
            'contact.phone': paymentRecord.recipientPhonePrefix,
            'contact.phonePrefix': paymentRecord.recipientPhoneNumber,
          },
        ],
      },
      'id'
    ).session(session);

    const receiver = receivers[0];

    if (receivers.length > 1) {
      multipleReceivers = true;
    }

    const transaction = await new TransactionModel({
      User: user._id,
      amount: driverPaymentData.grossAmount,
      txFee: paymentRecord.txFee,
      currency: paymentRecord.currency,
      driver: paymentRecord.driver,
      method: paymentRecord.method,
      marketplace: paymentRecord.marketplace,
      PaymentRecord: paymentRecord._id,
    });

    const purchases = await Promise.all(
      paymentRecord.items.map(async (item) => {
        const product = await ProductModel.findById(item.Product).session(
          session
        );

        if (!product) {
          throw new Error('Product not found');
        }

        const supplier = await PartnerModel.findById(product.Partner).session(
          session
        );

        if (!supplier) {
          throw new Error('Supplier not found');
        }

        // update product accordingly
        product.quantity -=
          product.quantity !== platformConstants.unlimited ? item.quantity : 0;
        product.qtySold += item.quantity;

        if (
          product.quantity !== platformConstants.unlimited &&
          product.quantity <= product.quantityAlert
        ) {
          product.isLowStock = true;
        }

        await product.save({ session });

        const txFee = currency(paymentRecord.txFee)
          .multiply(item.amount)
          .divide(paymentRecord.amount).value;

        const netAmount = currency(item.amount).subtract(txFee).value;

        // TODO: fetch redemption code if applicable

        // determine expiry based on the redemptionValidityType (date or period), use the redemptionValidityPeriodType (days, weeks, months) and redemptionValidityValue
        let expiresBy;

        if (
          product.redemptionValidityType &&
          product.redemptionValidityValue &&
          product.redemptionValidityPeriodType
        ) {
          if (product.redemptionValidityType === 'date') {
            expiresBy = product.redemptionValidityValue;
          } else {
            const calculatedDate = new Date(
              Date.now() +
                ms(
                  `${product.redemptionValidityValue} ${product.redemptionValidityPeriodType}`
                )
            );
            if (isDate(calculatedDate)) {
              expiresBy = calculatedDate;
            }
          }
        }

        // If no valid date was calculated, set expiresBy to 2 weeks from now
        if (!expiresBy || !isDate(expiresBy)) {
          expiresBy = new Date(Date.now() + ms('2 weeks'));
        }
        const { defaultSettlementConfig } = platformConstants;

        const priceStart = currency(
          supplier.settlingDetails.startProportion ||
            defaultSettlementConfig.startProportion
        )
          .divide(100)
          .multiply(netAmount).value;
        const priceFinish = currency(
          supplier.settlingDetails.finishProportion ||
            defaultSettlementConfig.finishProportion
        )
          .divide(100)
          .multiply(netAmount).value;
        const pifIncome = currency(
          supplier.settlingDetails.pifProportion ||
            defaultSettlementConfig.pifProportion
        )
          .divide(100)
          .multiply(netAmount).value;

        const purchase = await new PurchaseModel({
          Transaction: transaction._id,
          User: user._id,
          Product: product._id,
          Receiver: multipleReceivers ? undefined : receiver?._id,
          Partner: product.Partner,
          productName: product.name,
          productPhoto: product.photo,
          unitPrice: product.price,
          quantity: item.quantity,
          amount: item.amount,
          currency: paymentRecord.currency,
          txFee,
          netAmount: currency(item.amount).subtract(txFee).value,
          priceStart,
          priceFinish,
          pifIncome,
          proportion: {
            proportionStart: supplier.settlingDetails.startProportion,
            proportionFinish: supplier.settlingDetails.finishProportion,
            proportionPif: supplier.settlingDetails.pifProportion,
            fixedFee: supplier.settlingDetails.fixedFee,
          },
          senderPifId: paymentRecord.senderPifId,
          recipientPifId: paymentRecord.recipientPifId,
          recipientPhonePrefix: paymentRecord.recipientPhonePrefix,
          recipientPhoneNumber: paymentRecord.recipientPhoneNumber,
          Contact: paymentRecord.Contact,
          message: paymentRecord.message,
          code: '', // TODO: fetch redemption code if applicable
          discountCode: item.discountCode,
          marketplace: paymentRecord.marketplace,
          expiresBy,
          pifHistory: [
            {
              from: user.pifId,
              to:
                receiver?.pifId ||
                paymentRecord.recipientPhonePrefix +
                  paymentRecord.recipientPhoneNumber,
              recipientPhonePrefix: paymentRecord.recipientPhonePrefix,
              recipientPhoneNumber: paymentRecord.recipientPhoneNumber,
            },
          ],
        });

        await purchase.save({ session });

        return purchase;
      })
    );

    // attach transaction to purchases and save
    transaction.Purchases = purchases.map(
      (purchase) => purchase._id
    ) as unknown as ObjectId[];

    await transaction.save({ session });

    await sortTxCashFlows(purchases, transaction, session);

    // update discountCode(s) usage if applicable
    await Promise.all(
      paymentRecord.items.map(async (item) => {
        if (!item.discountCode) return;

        const discountCodeData = await DiscountCodeModel.findOne({
          code: item.discountCode,
          Product: item.Product,
        }).session(session);

        if (!discountCodeData) return;

        discountCodeData.useCount += item.quantity;
        await discountCodeData.save({ session });
      })
    );

    if (receiver && multipleReceivers) {
      // notify all receivers of the transaction and enforce confirmation before claiming the PIF
      await Promise.all(
        receivers.map((receiver) =>
          sendOtpToSenderIfNotConfirmed(receiver, session)
        )
      );
    }

    // 5. receiver and partner of the transaction
    // TODO: send push notification to receiver if receiver is on the platform
    // TODO: if the account of the receiver is not unique, send them all the push notification and send them OTP as well. Once OTP is confirmed, delete all other duplicate accounts
    await Promise.all(
      purchases.map(async (purchase) => {
        try {
          const partner = await PartnerModel.findById(
            purchase.Partner,
            'name phonePrefix phoneNumber email'
          ).session(session);

          const receiver = await UserModel.findById(purchase.Receiver, 'name')
            .lean()
            .session(session);

          await sendPartnerOrderNotification({
            productName: purchase.productName.find((name) => name.lang === 'en')
              ?.value,
            productId: purchase.Product.toString(),
            supplierName: partner?.name || '',
            supplierEmail: partner?.email || '',
            quantity: purchase.quantity,
            senderName: user.name,
            receiverName: receiver?.name || 'Buddy',
            receiverPhone:
              purchase.recipientPhonePrefix + purchase.recipientPhoneNumber,
            deliveryAt: paymentRecord.toBeDeliveredAt,
          });
        } catch (error) {}
      })
    );

    paymentRecord.isOrderProcessed = true;
    await paymentRecord.save({ session });

    await sendOtpToSenderIfNotConfirmed(user, session);

    return {
      message: 'Order processed successfully',
    };
  } catch (error) {
    // return { message: 'error occured while completing order' };
    throw error;
  }
};

export default completeTransaction;
