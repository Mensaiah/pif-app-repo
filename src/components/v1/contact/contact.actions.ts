import { Response } from 'express';

import { IRequest } from '../../../types/global';
import { handleResponse } from '../../../utils/helpers';
import { UserModel } from '../user/user.model';

import ContactModel from './contact.model';
import {
  getCountryFromFullPhoneNumber,
  sanitizeContact,
  RawContactType,
  SanitizedContactType,
} from './contact.utils';

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
    const userContacts = await ContactModel.find({ User: user._id });
    const newContacts = sanitizedContacts.filter(
      (contact: SanitizedContactType) =>
        !userContacts.find(
          (c) => c.phoneNumberDisplay === contact.phoneNumberDisplay
        )
    );

    const syncedContacts = await Promise.all(
      newContacts.map(async (contact: SanitizedContactType) => {
        const existingUser = await UserModel.findOne({
          'contact.fullPhoneNumber': contact.phoneNumberDisplay,
          userType: 'customer',
          isConfirmed: true,
        });

        if (!existingUser) return contact;

        return {
          ...contact,
          pifId: existingUser.pifId,
          hasApp: true,
        };
      })
    );

    const newSyncedContacts = syncedContacts.filter(
      (contact: any) =>
        !userContacts.find(
          (c) => c.phoneNumberDisplay === contact.phoneNumberDisplay
        )
    );

    await ContactModel.insertMany(
      newSyncedContacts.map((contact: any) => ({
        ...contact,
        User: user._id,
      }))
    );

    const allSyncedContacts = [...userContacts, ...newSyncedContacts];
    const contactsOnPif = allSyncedContacts.filter(
      (contact: any) => contact.pifId && contact.hasApp
    );
    const otherContacts = allSyncedContacts.filter(
      (contact: any) => !contact.pifId && !contact.hasApp
    );

    return handleResponse(res, {
      data: {
        // allContacts: allSyncedContacts,
        contactsOnPif: contactsOnPif,
        otherContacts: otherContacts,
      },
    });
  } catch (err) {
    handleResponse(res, 'Internal server error', 500, err);
  }
};

export const getContacts = async (req: IRequest, res: Response) => {
  const { user } = req;

  try {
    const userContacts = await ContactModel.find({ User: user._id });

    const contactsOnPif = userContacts.filter(
      (contact: any) => contact.pifId && contact.hasApp
    );
    const otherContacts = userContacts.filter(
      (contact: any) => !contact.pifId && !contact.hasApp
    );

    return handleResponse(res, {
      data: {
        // allContacts: userContacts,
        contactsOnPif: contactsOnPif,
        otherContacts: otherContacts,
      },
    });
  } catch (err) {
    handleResponse(res, 'Internal server error', 500, err);
  }
};
