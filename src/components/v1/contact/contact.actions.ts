import { Response } from 'express';

import { IRequest } from '../../../types/global';
import { handleResponse } from '../../../utils/helpers';
import { UserModel } from '../user/user.model';

import ContactModel from './contact.model';

export const syncContacts = async (req: IRequest, res: Response) => {
  const { user } = req;
  const { contacts } = req.body;

  try {
    const userContacts = await ContactModel.find({ User: user._id });
    const newContacts = contacts.filter(
      (contact: any) =>
        !userContacts.find(
          (c) => c.phoneNumberDisplay === contact.phoneNumberDisplay
        )
    );

    const syncedContacts = await Promise.all(
      newContacts.map(async (contact: any) => {
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
        allContacts: allSyncedContacts,
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
        allContacts: userContacts,
        contactsOnPif: contactsOnPif,
        otherContacts: otherContacts,
      },
    });
  } catch (err) {
    handleResponse(res, 'Internal server error', 500, err);
  }
};
