import { Response } from 'express';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import ContactModel from '../contact.model';

export { syncContacts } from './syncContacts';

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
