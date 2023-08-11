import { Response } from 'express';
import parseNumber, { CountryCode } from 'libphonenumber-js';
import { ObjectId } from 'mongoose';
import { z } from 'zod';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import ContactModel from '../../contact/contact.model';
import { UserModel } from '../../user/user.model';
import PurchaseModel from '../purchase.model';
import { passOnPifSchema } from '../purchase.policy';

export const passOnPif = async (req: IRequest, res: Response) => {
  const { purchaseId } = req.params;
  const { user } = req;

  type dataType = z.infer<typeof passOnPifSchema>;
  const {
    recipientPifId,
    recipientPhoneNumber,
    recipientPhonePrefix,
    contactId,
    message,
    toBeDeliveredAt,
  }: dataType = req.body;

  try {
    const contact = contactId
      ? await ContactModel.findOne({ _id: contactId })
      : null;
    if (contact && contact.User.toString() !== user._id.toString()) {
      return handleResponse(res, 'this contact is not yours', 401);
    }

    const parsedContact = contact
      ? parseNumber(contact.phoneNumber, contact.countryCode as CountryCode)
      : null; // use parseNumber with country code
    const contactPrefix = parsedContact?.countryCallingCode || null;
    const contactNumber = parsedContact?.nationalNumber || null;

    if (!contact && !recipientPifId && !recipientPhoneNumber) {
      return handleResponse(
        res,
        'You must provide a valid contact or a recipient',
        400
      );
    }

    const receiver = await UserModel.findOne({
      userType: 'customer',
      $or: [
        recipientPifId ? { pifId: recipientPifId } : null,
        recipientPhoneNumber
          ? {
              'contact.phonePrefix': recipientPhonePrefix,
              'contact.phoneNumber': recipientPhoneNumber,
            }
          : null,
        contact?.pifId ? { pifId: contact.pifId } : null,
        parsedContact
          ? {
              'contact.phoneNumber': contactNumber,
              'contact.phonePrefix': contactPrefix,
            }
          : null,
      ].filter(Boolean),
    });

    const purchase = await PurchaseModel.findById(purchaseId);

    if (!purchase) {
      return handleResponse(res, 'not found', 404);
    }

    if (
      purchase.recipientPifId !== req.pifId &&
      (purchase.recipientPhonePrefix !== contactPrefix ||
        purchase.recipientPhoneNumber !== contactNumber)
    ) {
      return handleResponse(res, 'unauthorized', 401);
    }

    if (!purchase.unwrapedAt) {
      return handleResponse(res, 'pif has not been unwrapped', 200);
    }

    if (purchase.redeemedAt) {
      return handleResponse(
        res,
        'pif has been redeemed and can not be passed on',
        400
      );
    }

    purchase.recipientPifId = recipientPifId || contact?.pifId || null;
    purchase.recipientPhoneNumber =
      recipientPhoneNumber || contactNumber || null;
    purchase.recipientPhonePrefix =
      recipientPhonePrefix || contactPrefix || null;
    if (receiver) purchase.Receiver = receiver._id as unknown as ObjectId;
    if (contact) purchase.Contact = contact._id as unknown as ObjectId;
    if (message) purchase.message = message;

    purchase.pifHistory.push({
      from: req.pifId,
      to:
        recipientPifId ||
        `${recipientPhonePrefix}${recipientPhoneNumber}` ||
        `${contactPrefix}${contactNumber}`,
      recipientPhonePrefix: recipientPhonePrefix || contactPrefix,
      recipientPhoneNumber: recipientPhoneNumber || contactNumber,
      message: message || '',
    });

    if (toBeDeliveredAt) purchase.deliveryAt = toBeDeliveredAt;

    await purchase.save();

    return handleResponse(res, 'Passed on successfully', 200);
  } catch (err) {
    handleResponse(res, 'Internal server error', 500, err);
  }
};
