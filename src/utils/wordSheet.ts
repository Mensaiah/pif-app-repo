import { LanguageCode } from '../types/global';

const wordSheet = {
  upAndRunning: {
    en: 'Platform is up and running',
    da: 'Platformen kører',
    fr: "La plate-forme est prête et en cours d'exécution",
  },
  welcomeToPIF: {
    en: 'Welcome to PIF',
    da: 'Velkommen til PIF',
    fr: 'Bienvenue chez PIF',
  },
  welcomeToServer: {
    en: 'Welcome to the server!',
    da: 'Velkommen til serveren!',
    fr: 'Bienvenue sur le serveur !',
  },
  welcomeToAPI: {
    en: 'Welcome to the beginning of nothingness 👨🏽‍💻🚀',
    da: 'Velkommen til begyndelsen af ingenting 👨🏽‍💻🚀',
    fr: 'Bienvenue au commencement du néant 👨🏽‍💻🚀',
  },
  invalidMethodRoute: {
    en: 'You have used an invalid method or hit an invalid route',
    da: 'Du har brugt en ugyldig metode eller ramt en ugyldig rute',
    fr: 'Vous avez utilisé une méthode invalide ou accédé à une route invalide',
  },
  userExistsAlready: {
    en: 'User already exist, login instead',
    da: 'Brugeren findes allerede, log ind i stedet',
    fr: "L'utilisateur existe déjà, connectez-vous plutôt",
  },
  operationFailedTryLater: {
    en: 'Operation failed, try again later',
    da: 'Operationen mislykkedes, prøv igen senere',
    fr: "L'opération a échoué, réessayez plus tard",
  },
  accountBanned: {
    en: 'Your account has been banned, Contact us',
    da: 'Din konto er blevet udelukket, Kontakt os',
    fr: 'Votre compte a été banni, contactez-nous',
  },
  incorrectLogin: {
    en: 'Incorrect login credentials, try again',
    da: 'Forkerte loginoplysninger, prøv igen',
    fr: "Informations d'identification de connexion incorrectes, réessayez",
  },
  expiredToken: {
    en: 'Authentication expired, login again please',
    da: 'Autentifikation udløbet, log venligst ind igen',
    fr: "L'authentification a expiré, veuillez vous reconnecter",
  },
  authIsRequired: {
    en: 'Authentication is required',
    da: 'Autentificering er påkrævet',
    fr: "L'authentification est requise",
  },
  invalidSession: {
    en: 'Invalid session. Kindly login',
    da: 'Ugyldig session. Log venligst ind',
    fr: 'Session invalide. Veuillez vous connecter',
  },
  loggedOut: {
    en: 'Session logged out, kindly login',
    da: 'Session logget ud, log venligst ind',
    fr: 'Session déconnectée, veuillez vous connecter',
  },
  cityAlreadyExists: {
    en: 'City already exists',
    da: 'Byen findes allerede',
    fr: 'La ville existe déjà',
  },
  cityCreatedSuccessfully: {
    en: 'City created successfully',
    da: 'Byen oprettet med succes',
    fr: 'La ville a été créée avec succès',
  },
  cityDoesntExist: {
    en: "City doesn't exist",
    da: 'Byen findes ikke',
    fr: "La ville n'existe pas",
  },
  cityUpdatedSuccessfully: {
    en: 'City updated successfully',
    da: 'Byen opdateret med succes',
    fr: 'La ville a été mise à jour avec succès',
  },
  cityDeletedSuccessfully: {
    en: 'City deleted successfully',
    da: 'Byen slettet med succes',
    fr: 'La ville a été supprimée avec succès',
  },
  countryAlreadyExists: {
    en: 'Country already exists',
    da: 'Landet findes allerede',
    fr: 'Le pays existe déjà',
  },
  countryCreatedSuccessfully: {
    en: 'Country created successfully',
    da: 'Landet blev oprettet med succes',
    fr: 'Le pays a été créé avec succès',
  },
  countryDoesntExist: {
    en: "Country doesn't exist",
    da: 'Landet findes ikke',
    fr: "Le pays n'existe pas",
  },
  countryUpdatedSuccessfully: {
    en: 'Country updated successfully',
    da: 'Landet opdateret med succes',
    fr: 'Le pays a été mis à jour avec succès',
  },
  countryDeletedSuccessfully: {
    en: 'Country deleted successfully',
    da: 'Landet slettet med succes',
    fr: 'Le pays a été supprimé avec succès',
  },
  userNotFound: {
    en: 'User not found',
    da: 'Bruger ikke fundet',
    fr: 'Utilisateur non trouvé',
  },
  userUpdatedSuccessfully: {
    en: 'User updated successfully',
    da: 'Bruger opdateret med succes',
    fr: 'Utilisateur mis à jour avec succès',
  },
  passwordResetSuccess: {
    en: 'Password reset successfully',
    da: 'Adgangskode nulstillet med succes',
    fr: 'Réinitialisation du mot de passe réussie',
  },
  passwordChangeSuccess: {
    en: 'Password changed successfully',
    da: 'Adgangskode ændret med succes',
    fr: 'Mot de passe modifié avec succès',
  },
  newPasswordSameAsOld: {
    en: 'New password cannot be the same as the old password',
    da: 'Ny adgangskode må ikke være den samme som den gamle adgangskode',
    fr: "Le nouveau mot de passe ne peut pas être identique à l'ancien",
  },
  incorrectOldPassword: {
    en: 'Incorrect old password',
    da: 'Forkert gammel adgangskode',
    fr: 'Ancien mot de passe incorrect',
  },
  emailUpdateSuccess: {
    en: 'Email updated successfully',
    da: 'E-mail opdateret med succes',
    fr: 'Adresse e-mail mise à jour avec succès',
  },
  profileUpdated: {
    en: 'Profile updated',
    da: 'Profil opdateret',
    fr: 'Profil mis à jour',
  },
  serverError: {
    en: 'Server error',
    da: 'Serverfejl',
    fr: 'Erreur de serveur',
  },
  dataNotFound: {
    en: 'Data not found',
    da: 'Data ikke fundet',
    fr: 'Données non trouvées',
  },
  requestSuccess: {
    en: 'Request successful',
    da: 'Anmodning vellykket',
    fr: 'Requête réussie',
  },
  operationSuccess: {
    en: 'Operation successful',
    da: 'Operationen lykkedes',
    fr: 'Opération réussie',
  },
  internalServerError: {
    en: "Internal server error. We're duly notified and will fix this. Try again later",
    da: 'Intern serverfejl. Vi er blevet underrettet og vil rette fejlen hurtigst muligt. Prøv igen senere',
    fr: 'Erreur interne du serveur. Nous en avons été informés et résoudrons ce problème. Réessayez plus tard.',
  },
};

export const useWord = (
  word: keyof typeof wordSheet,
  lang: LanguageCode = 'en'
) => (wordSheet[word] ? wordSheet[word][lang] : word);
