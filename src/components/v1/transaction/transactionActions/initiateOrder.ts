/* eslint-disable max-lines */
import Currency from 'currency.js';
import { Response } from 'express';
import parseNumber, { CountryCode } from 'libphonenumber-js';
import mongoose, { Document } from 'mongoose';
import { z } from 'zod';

import platformConstants from '../../../../config/platformConstants';
import {
  initiatePayment,
  verifyPayment,
} from '../../../../services/paymentProcessors';
import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import ContactModel from '../../contact/contact.model';
import { ContactAttributes } from '../../contact/contact.types';
import { canDiscountCodeBeApplied } from '../../discountCode/discountCode.utils';
import { PartnerModel } from '../../partner/partner.model';
import { PaymentDriverType } from '../../platform/platform.types';
import { getMarketplaceCurrency } from '../../platform/platform.utils';
import ProductModel from '../../product/product.model';
import { UserModel } from '../../user/user.model';
import { UserAttributes } from '../../user/user.types';
import { PaymentRecordModel } from '../transaction.model';
import { initiateOrderSchema } from '../transaction.policy';
import completeTransactionn from '../transactionUtils/completeTransaction';

const initiateOrder = async (req: IRequest, res: Response) => {
  type dataType = z.infer<typeof initiateOrderSchema>;

  const { userAccess, user, userType, currentMarketplace, pifId } = req;

  const {
    idempotencyKey,
    driver,
    items,
    recipientPifId,
    recipientPhonePrefix,
    recipientPhoneNumber,
    message,
    contactId,
    toBeDeliveredAt,
  }: dataType = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  if (userType !== 'customer') {
    await session.abortTransaction();
    session.endSession();

    return handleResponse(
      res,
      'You are not allowed to perform this operation',
      403
    );
  }

  let contact: undefined | (Document & ContactAttributes);
  let receiver: undefined | (Document & UserAttributes);

  try {
    const existingPaymentRecord = await PaymentRecordModel.findOne({
      idempotencyKey,
    }).session(session);

    const errorMessages: string[] = [];

    let paymentRecord = existingPaymentRecord;

    if (paymentRecord) {
      // validate the payment, if successful, update the payment record
      if (
        paymentRecord.status === 'successful' &&
        paymentRecord.isOrderProcessed
      ) {
        await session.abortTransaction();
        session.endSession();

        return handleResponse(
          res,
          {
            message: 'Payment already made',
            data: {
              status: paymentRecord.status,
            },
          },
          200
        );
      }

      // check payment from driver service to see if it was successful, if it is, update the payment record and return success
      const paymentStatus = await verifyPayment(
        paymentRecord.driver,
        paymentRecord.driverRefernce
      );

      if (paymentStatus.success) {
        paymentRecord.status = 'successful';
        paymentRecord.history.push({
          event: `${driver}-payment-verified`,
          data: paymentStatus.receiptUrl || paymentRecord.driverRefernce,
          happenedAt: new Date(),
        });

        await paymentRecord.save({ session });

        await completeTransactionn(
          user as UserAttributes & Document,
          paymentRecord,
          paymentStatus,
          session
        );

        await session.commitTransaction();
        session.endSession();

        return handleResponse(
          res,
          {
            message: 'Payment successful',
            data: {
              status: paymentRecord.status,
            },
          },
          200
        );
      } else {
        await session.abortTransaction();
        session.endSession();

        return handleResponse(
          res,
          {
            message: 'Make your payment',
            data: {
              status: paymentRecord.status,
              paymentLink: paymentRecord.history[0].data ?? null,
              paymentId: paymentRecord.history[0].data ?? null,
            },
          },
          200
        );
      }
    } else {
      contact = contactId ? await ContactModel.findById(contactId) : null;

      if (contact && contact.User.toString() !== user._id.toString()) {
        await session.abortTransaction();
        session.endSession();

        return handleResponse(
          res,
          "Supplied contact doesn't belong to you",
          403
        );
      }

      receiver = recipientPifId
        ? await UserModel.findOne({ pifId: recipientPifId })
        : null;
      if (recipientPifId && !receiver) {
        await session.abortTransaction();
        session.endSession();

        return handleResponse(res, 'Recipient pif id is not valid', 400);
      }

      if (!contact && !receiver && !recipientPhoneNumber) {
        await session.abortTransaction();
        session.endSession();

        return handleResponse(
          res,
          'Please provide a valid contact or recipient phone number or recipient pif id',
          400
        );
      }

      // fetch product prices and info in the items array
      let itemsData = await Promise.all(
        items.map(async (item) => {
          // fetch product info
          const product = await ProductModel.findById(item.productId).session(
            session
          );

          if (!product) return null;
          if (!product.isApproved) return null;
          if (!product.isActive) return null;

          if (
            product.quantity !== platformConstants.unlimited &&
            product.quantity < item.quantity
          ) {
            errorMessages.push(
              `Product ${product.name} is out of stock. Please reduce the quantity`
            );
            return null;
          }

          const Partner = await PartnerModel.findById(
            product.Partner,
            'isCharity'
          ).session(session);

          if (!Partner) return null;

          if (product.marketplace !== currentMarketplace) {
            errorMessages.push(
              `Product ${product.name} is not available in this marketplace`
            );
            return null;
          }

          let unitPrice = product.price;

          const [isDiscountApplicable, discountCode] =
            await canDiscountCodeBeApplied(
              item.discountCode,
              product._id,
              user._id
            );

          if (isDiscountApplicable && discountCode) {
            unitPrice =
              discountCode.discountType === 'fixed'
                ? Currency(unitPrice).subtract(discountCode.value).value
                : Currency(unitPrice)
                    .subtract(unitPrice)
                    .multiply(discountCode?.value)
                    .divide(100).value;
          }

          if (unitPrice < 0) unitPrice = 0;

          // calculate amount
          const amount = Currency(unitPrice).multiply(item.quantity).value;

          return {
            Partner: product.Partner,
            Product: product._id,
            productName: product.name,
            productPhoto: product.photo || product.photos[0] || '',
            unitPrice,
            quantity: item.quantity,
            amount,
            discountCode: item.discountCode,
            isCharity: Partner.isCharity ?? false,
          };
        })
      );

      itemsData = itemsData.filter((item) => item !== null);

      if (itemsData.length === 0) {
        await session.abortTransaction();
        session.endSession();

        return handleResponse(
          res,
          {
            message: 'No items or all items are invalid',
            errors: errorMessages,
          },
          400
        );
      }

      // calculate total amount
      const amount = itemsData.reduce(
        (acc, item) => Currency(acc).add(item.amount).value,
        0
      );

      const currency = await getMarketplaceCurrency(currentMarketplace);

      const parsedContact = contact
        ? parseNumber(contact.phoneNumber, contact.countryCode as CountryCode)
        : null; // use parseNumber with country code
      const contactPrefix = parsedContact?.countryCallingCode || null;
      const contactNumber = parsedContact?.nationalNumber || null;

      paymentRecord = new PaymentRecordModel({
        idempotencyKey,
        User: userAccess.User,
        amount,
        currency: currency || '$',
        marketplace:
          'currentMarketplace' in user ? user.currentMarketplace : '',
        items: itemsData,
        senderPifId: pifId,
        recipientPifId:
          recipientPifId || contact?.pifId || receiver?.pifId || null,
        recipientPhonePrefix:
          recipientPhonePrefix ||
          contactPrefix ||
          receiver?.contact?.phonePrefix ||
          null,
        recipientPhoneNumber:
          recipientPhoneNumber ||
          contactNumber ||
          receiver?.contact?.phone ||
          null,
        Contact: contactId,
        message,
        toBeDeliveredAt,
      });
    }

    paymentRecord.driver = driver as PaymentDriverType;

    // generate link or id for payment based on the driver
    const { errorMessage, paymentId, paymentLink, driverReference } =
      await initiatePayment({
        driver: paymentRecord.driver,
        amount: paymentRecord.amount,
        items: paymentRecord.items.map((item) => ({
          reference: item.Product.toString(),
          name: item.productName,
          quantity: item.quantity,
          unit: 'pcs',
          uniPrice: item.unitPrice,
          grossTotal: item.amount,
          netTotal: item.amount,
        })),
        currency: paymentRecord.currency,
        idempotencyKey,
        user: req.user as UserAttributes & Document,
        refId: paymentRecord._id,
        marketplace: paymentRecord.marketplace,
      }).catch(async (err) => {
        throw err;
      });

    if (errorMessage) {
      await session.abortTransaction();
      session.endSession();

      return handleResponse(res, errorMessage, 400);
    }

    if (paymentLink || paymentId) {
      paymentRecord.paymentLinkOrId = paymentId;
      paymentRecord.driverRefernce = driverReference;
      paymentRecord.history.push({
        event: `${driver}-payment-initiated`,
        data: paymentLink || paymentId,
        happenedAt: new Date(),
        comment: `Reference: ${driverReference}`,
      });
    }

    await paymentRecord.save({ session }).catch(async (err) => {
      throw err;
    });

    await session.commitTransaction();
    session.endSession();

    return handleResponse(
      res,
      {
        message: 'Make your payment',
        data: {
          status: paymentRecord.status,
          paymentLink: paymentLink ?? null,
          paymentId: paymentId ?? null,
        },
      },
      200
    );
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    handleResponse(res, 'Error handling request at this time', 500, err);
  }
};

export default initiateOrder;
