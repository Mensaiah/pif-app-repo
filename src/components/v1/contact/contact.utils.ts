import parsePhoneNumber, { CountryCode } from 'libphonenumber-js';

export type SanitizedContactType = {
  name: string;
  phoneNumber: string;
  phoneNumberDisplay: string;
  countryCode: string;
};

export type RawContactType = {
  firstName?: string;
  lastName?: string;
  name: string;
  id: string;
  phoneNumbers: Array<{
    label?: string;
    countryCode?: string;
    number: string;
    digits?: string;
    id: string;
  }>;
};

const getFullName = (contact: RawContactType): string => {
  return (
    contact.name ||
    `${contact.firstName} ${contact.lastName}`.trim() ||
    'Unknown'
  );
};

const sanitizePhoneNumber = (
  phoneNumber: RawContactType['phoneNumbers'][0],
  defaultCountryCode: string,
  name: string
) => {
  const numberToParse = phoneNumber.digits || phoneNumber.number;
  const parsedNumber = parsePhoneNumber(
    numberToParse,
    numberToParse.startsWith('+')
      ? undefined
      : phoneNumber.countryCode
      ? (phoneNumber.countryCode.toUpperCase() as CountryCode)
      : (defaultCountryCode as CountryCode)
  );
  if (!phoneNumber.digits || !parsedNumber || !parsedNumber.isValid())
    return null;

  return {
    name,
    phoneNumber: phoneNumber.digits,
    phoneNumberDisplay: phoneNumber.number,
    countryCode: phoneNumber.countryCode,
  };
};

export const sanitizeContact = (
  rawContact: RawContactType,
  defaultCountryCode: string
): SanitizedContactType[] => {
  if (!rawContact.phoneNumbers || rawContact.phoneNumbers.length === 0) {
    return [];
  }

  const contactName = getFullName(rawContact);

  return rawContact.phoneNumbers
    .map((phoneNumber) =>
      sanitizePhoneNumber(phoneNumber, defaultCountryCode, contactName)
    )
    .filter(Boolean) as SanitizedContactType[];
};

export const getCountryFromFullPhoneNumber = (
  fullPhoneNumber: string
): string => {
  if (!fullPhoneNumber) return null;
  if (!fullPhoneNumber.startsWith('+')) fullPhoneNumber = '+' + fullPhoneNumber;

  return parsePhoneNumber(fullPhoneNumber)?.country;
};
