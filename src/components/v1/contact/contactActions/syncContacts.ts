import { Response } from 'express';
import { CountryCode, parsePhoneNumber } from 'libphonenumber-js';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import { UserModel } from '../../user/user.model';
import ContactModel from '../contact.model';
import {
  getCountryFromFullPhoneNumber,
  sanitizeContact,
  RawContactType,
  SanitizedContactType,
} from '../contact.utils';

export const syncContacts = async (req: IRequest, res: Response) => {
  const { user } = req;
  const { contacts } = req.body;

  if (!user.contact?.phonePrefix || !user.contact?.phone) {
    return handleResponse(
      res,
      'Please update your contact under Profile first',
      400
    );
  }

  if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
    return handleResponse(res, 'No contacts to sync', 400);
  }

  const defaultCountryCode = getCountryFromFullPhoneNumber(
    user.contact.phonePrefix + user.contact.phone
  );

  const sanitizedContacts = contacts
    .map((contact: RawContactType) =>
      sanitizeContact(contact, defaultCountryCode)
    )
    .flat();

  try {
    const userContacts = await ContactModel.find({ User: user._id }).lean();

    const newContacts = sanitizedContacts.filter(
      (contact: SanitizedContactType) =>
        !userContacts.find(
          (c) => c.phoneNumberDisplay === contact.phoneNumberDisplay
        )
    );

    // Filter old contacts that don't have a pifId
    const oldContactsWithoutPifId = userContacts.filter(
      (contact) => !contact.pifId
    );
    const oldContactsWithPifId = userContacts.filter(
      (contact) => !!contact.pifId
    );

    // Combine new contacts and old contacts without pifId
    const contactsToCheck = [...newContacts, ...oldContactsWithoutPifId];

    const syncedContacts = await Promise.all(
      contactsToCheck.map(async (contact: any) => {
        const numberToParse =
          contact.phoneNumberDisplay ||
          contact.phoneNumber ||
          contact.number ||
          contact.digits;

        const parsedNumber = parsePhoneNumber(
          numberToParse,
          numberToParse.startsWith('+')
            ? undefined
            : contact.countryCode
            ? (contact.countryCode.toUpperCase() as CountryCode)
            : (defaultCountryCode as CountryCode)
        );

        const phone = parsedNumber.nationalNumber;
        const prefix = '+' + parsedNumber.countryCallingCode;
        const existingUser = await UserModel.findOne({
          'contact.phone': phone,
          'contact.phonePrefix': prefix.replace('+', ''),
          userType: 'customer',
          isConfirmed: true,
        });

        return {
          ...contact,
          pifId: existingUser?.pifId,
          hasApp: !!existingUser,
        };
      })
    );

    await Promise.all(
      syncedContacts.map(async (contact: SanitizedContactType) => {
        const existingContact = await ContactModel.findOne({
          phoneNumberDisplay: contact.phoneNumberDisplay,
          User: user._id,
        });
        if (existingContact) {
          // Convert the Mongoose document into a plain JavaScript object
          const updateData = { ...existingContact.toObject(), ...contact };
          return ContactModel.updateOne(
            { _id: existingContact._id },
            updateData
          );
        } else {
          return ContactModel.create({
            ...contact,
            User: user._id,
          });
        }
      })
    );

    const contactsOnPif = syncedContacts
      .filter((contact: any) => contact.pifId && contact.hasApp)
      .map((contact) => {
        if (contact.toObject) {
          return contact.toObject();
        }
        return contact;
      });

    const otherContacts = syncedContacts
      .filter((contact: any) => !contact.pifId && !contact.hasApp)
      .map((contact) => {
        if (contact.toObject) {
          return contact.toObject();
        }
        return contact;
      });

    return handleResponse(res, {
      data: {
        contactsOnPif: [...contactsOnPif, ...oldContactsWithPifId],
        otherContacts: otherContacts,
      },
    });
  } catch (err) {
    handleResponse(res, 'Internal server error', 500, err);
  }
};
