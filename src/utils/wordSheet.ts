import { LanguageCode } from '../types/global';

const wordSheet = {
  upAndRunning: {
    en: 'Platform is up and running',
    da: 'Platformen kører',
  },
  welcomeToPIF: {
    en: 'Welcome to PIF',
    da: 'Velkommen til PIF',
  },
  welcomeToServer: {
    en: 'Welcome to the server!',
    da: 'Velkommen til serveren!',
  },
  welcomeToAPI: {
    en: 'Welcome to the beginning of nothingness 👨🏽‍💻🚀',
    da: 'Velkommen til begyndelsen af ingenting 👨🏽‍💻🚀',
  },
  invalidMethodRoute: {
    en: 'You have used an invalid method or hit an invalid route',
    da: 'Du har brugt en ugyldig metode eller ramt en ugyldig rute',
  },
  userExistsAlready: {
    en: 'User already exist, login instead',
    da: 'Brugeren findes allerede, log ind i stedet',
  },
  operationFailedTryLater: {
    en: 'Operation failed, try again later',
    da: 'Operationen mislykkedes, prøv igen senere',
  },
  accountBanned: {
    en: 'Your account has been banned, Contact us',
    da: 'Din konto er blevet udelukket, Kontakt os',
  },
  incorrectLogin: {
    en: 'Incorrect login credentials, try again',
    da: 'Forkerte loginoplysninger, prøv igen',
  },
  expiredToken: {
    en: 'Authentication expired, login again please',
    da: 'Autentifikation udløbet, log venligst ind igen',
  },
  authIsRequired: {
    en: 'Authentication is required',
    da: 'Autentificering er påkrævet',
  },
  invalidSession: {
    en: 'Invalid session. Kindly login',
    da: 'Ugyldig session. Log venligst ind',
  },
  loggedOut: {
    en: 'Session logged out, kindly login',
    da: 'Session logget ud, log venligst ind',
  },
  cityAlreadyExists: {
    en: 'City already exists',
    da: 'Byen findes allerede',
  },
  cityCreatedSuccessfully: {
    en: 'City created successfully',
    da: 'Byen oprettet med succes',
  },
  cityDoesntExist: {
    en: "City doesn't exist",
    da: 'Byen findes ikke',
  },
  cityUpdatedSuccessfully: {
    en: 'City updated successfully',
    da: 'Byen opdateret med succes',
  },
  cityDeletedSuccessfully: {
    en: 'City deleted successfully',
    da: 'Byen slettet med succes',
  },
  countryAlreadyExists: {
    en: 'Country already exists',
    da: 'Landet findes allerede',
  },
  countryCreatedSuccessfully: {
    en: 'Country created successfully',
    da: 'Landet blev oprettet med succes',
  },
  countryDoesntExist: {
    en: "Country doesn't exist",
    da: 'Landet findes ikke',
  },
  countryUpdatedSuccessfully: {
    en: 'Country updated successfully',
    da: 'Landet opdateret med succes',
  },
  countryDeletedSuccessfully: {
    en: 'Country deleted successfully',
    da: 'Landet slettet med succes',
  },
  userNotFound: {
    en: 'User not found',
    da: 'Bruger ikke fundet',
  },
  userUpdatedSuccessfully: {
    en: 'User updated successfully',
    da: 'Bruger opdateret med succes',
  },
  passwordResetSuccess: {
    en: 'Password reset successfully',
    da: 'Adgangskode nulstillet med succes',
  },
  passwordChangeSuccess: {
    en: 'Password changed successfully',
    da: 'Adgangskode ændret med succes',
  },
  newPasswordSameAsOld: {
    en: 'New password cannot be the same as the old password',
    da: 'Ny adgangskode må ikke være den samme som den gamle adgangskode',
  },
  incorrectOldPassword: {
    en: 'Incorrect old password',
    da: 'Forkert gammel adgangskode',
  },
  emailUpdateSuccess: {
    en: 'Email updated successfully',
    da: 'E-mail opdateret med succes',
  },
  profileUpdated: {
    en: 'Profile updated',
    da: 'Profil opdateret',
  },
  serverError: {
    en: 'Server error',
    da: 'Serverfejl',
  },
  dataNotFound: {
    en: 'Data not found',
    da: 'Data ikke fundet',
  },
  requestSuccess: {
    en: 'Request successful',
    da: 'Anmodning vellykket',
  },
  operationSuccess: {
    en: 'Operation successful',
    da: 'Operationen lykkedes',
  },
  internalServerError: {
    en: "Internal server error. We're duly notified and will fix this. Try again later",
    da: 'Intern serverfejl. Vi er blevet underrettet og vil rette fejlen hurtigst muligt. Prøv igen senere',
  },
};

export const useWord = (word: keyof typeof wordSheet, lang: LanguageCode) =>
  wordSheet[word] ? wordSheet[word][lang] : word;
