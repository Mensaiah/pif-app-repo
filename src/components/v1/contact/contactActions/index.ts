import { Response } from 'express';

import { IRequest } from '../../../../types/global';
import { handleResponse } from '../../../../utils/helpers';
import ContactModel from '../contact.model';

export { syncContacts } from './syncContacts';
// export const syncContacts = async (req: IRequest, res: Response) => {
//   const { user } = req;
//   const { contacts } = req.body;

//   if (!user.contact?.phonePrefix || !user.contact?.phone) {
//     return handleResponse(
//       res,
//       'Please update your contact under Profile first',
//       400
//     );
//   }

//   if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
//     return handleResponse(res, 'No contacts to sync', 400);
//   }

//   consoleLog('Syncing contacts', 'info');

//   const defaultCountryCode = getCountryFromFullPhoneNumber(
//     user.contact.phonePrefix + user.contact.phone
//   );

//   consoleLog(`Default country code: ${defaultCountryCode}`, 'info');

//   const sanitizedContacts = contacts
//     .map((contact: RawContactType) =>
//       sanitizeContact(contact, defaultCountryCode)
//     )
//     .flat();

//   consoleLog(`Sanitized contacts: ${sanitizedContacts.length}`, 'info');

//   try {
//     const userContacts = await ContactModel.find({ User: user._id }).lean();
//     consoleLog(`User contacts: ${userContacts.length}`, 'info');

//     const newContacts = sanitizedContacts.filter(
//       (contact: SanitizedContactType) =>
//         !userContacts.find(
//           (c) => c.phoneNumberDisplay === contact.phoneNumberDisplay
//         )
//     );

//     // Filter old contacts that don't have a pifId
//     const oldContactsWithoutPifId = userContacts.filter(
//       (contact) => !contact.pifId
//     );
//     const oldContactsWithPifId = userContacts.filter(
//       (contact) => !!contact.pifId
//     );

//     // Combine new contacts and old contacts without pifId
//     const contactsToCheck = [...newContacts, ...oldContactsWithoutPifId];

//     const syncedContacts = await Promise.all(
//       contactsToCheck.map(async (contact: any) => {
//         const numberToParse =
//           contact.phoneNumberDisplay ||
//           contact.phoneNumber ||
//           contact.number ||
//           contact.digits;

//         consoleLog(`Checking contact: ${numberToParse}`, 'info');
//         consoleLog(JSON.stringify({ contact }, null, 2));

//         const parsedNumber = parsePhoneNumber(
//           numberToParse,
//           numberToParse.startsWith('+')
//             ? undefined
//             : contact.countryCode
//             ? (contact.countryCode.toUpperCase() as CountryCode)
//             : (defaultCountryCode as CountryCode)
//         );

//         const phone = parsedNumber.nationalNumber;
//         const prefix = '+' + parsedNumber.countryCallingCode;
//         const existingUser = await UserModel.findOne({
//           'contact.phone': phone,
//           'contact.phonePrefix': prefix.replace('+', ''),
//           userType: 'customer',
//           isConfirmed: true,
//         });

//         consoleLog(
//           `Existing user: ${JSON.stringify(existingUser, null, 2)}`,
//           'info'
//         );

//         return {
//           ...contact,
//           pifId: existingUser?.pifId,
//           hasApp: !!existingUser,
//         };
//       })
//     );

//     consoleLog(
//       `Synced contacts: ${JSON.stringify(syncedContacts, null, 2)}`,
//       'info'
//     );

//     await Promise.all(
//       syncedContacts.map(async (contact: SanitizedContactType) => {
//         const existingContact = await ContactModel.findOne({
//           phoneNumberDisplay: contact.phoneNumberDisplay,
//           User: user._id,
//         });
//         if (existingContact) {
//           // Convert the Mongoose document into a plain JavaScript object
//           const updateData = { ...existingContact.toObject(), ...contact };
//           return ContactModel.updateOne(
//             { _id: existingContact._id },
//             updateData
//           );
//         } else {
//           return ContactModel.create({
//             ...contact,
//             User: user._id,
//           });
//         }
//       })
//     );

//     consoleLog(
//       'syncContacts: ' + JSON.stringify(syncContacts, null, 2),
//       'info'
//     );

//     const contactsOnPif = syncedContacts
//       .filter((contact: any) => contact.pifId && contact.hasApp)
//       .map((contact) => {
//         if (contact.toObject) {
//           return contact.toObject();
//         }
//         return contact;
//       });

//     const otherContacts = syncedContacts
//       .filter((contact: any) => !contact.pifId && !contact.hasApp)
//       .map((contact) => {
//         if (contact.toObject) {
//           return contact.toObject();
//         }
//         return contact;
//       });

//     return handleResponse(res, {
//       data: {
//         contactsOnPif: [...contactsOnPif, ...oldContactsWithPifId],
//         otherContacts: otherContacts,
//       },
//     });
//   } catch (err) {
//     consoleLog(err, 'error');
//     handleResponse(res, 'Internal server error', 500, err);
//   }
// };

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
