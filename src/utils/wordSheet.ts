/* eslint-disable max-lines */
import platformConstants from '../config/platformConstants';
import { LanguageCode } from '../types/global';

const languageCodes = platformConstants.supportedLanguages;

const wordSheet = {
  upAndRunning: {
    en: 'Platform is up and running',
    da: 'Platformen kører',
    fr: "La plate-forme est prête et en cours d'exécution",
    sv: 'Plattformen är klar och igång',
    es: 'La plataforma está lista y funcionando',
  },
  welcomeToPIF: {
    en: 'Welcome to PIF',
    da: 'Velkommen til PIF',
    fr: 'Bienvenue chez PIF',
    sv: 'Välkommen till PIF',
    es: 'Bienvenido a PIF',
  },
  welcomeToServer: {
    en: 'Welcome to the server!',
    da: 'Velkommen til serveren!',
    fr: 'Bienvenue sur le serveur !',
    sv: 'Välkommen till servern!',
    es: '¡Bienvenido al servidor!',
  },
  welcomeToAPI: {
    en: 'Welcome to the beginning of nothingness 👨🏽‍💻🚀',
    da: 'Velkommen til begyndelsen af ingenting 👨🏽‍💻🚀',
    fr: 'Bienvenue au commencement du néant 👨🏽‍💻🚀',
    sv: 'Välkommen till början av ingenting 👨🏽‍💻🚀',
    es: 'Bienvenidos al comienzo de la nad 👨🏽‍💻🚀',
  },
  invalidMethodRoute: {
    en: 'You have used an invalid method or hit an invalid route',
    da: 'Du har brugt en ugyldig metode eller ramt en ugyldig rute',
    fr: 'Vous avez utilisé une méthode invalide ou accédé à une route invalide',
    sv: 'Du använde en ogiltig metod eller fick åtkomst till en ogiltig rutt',
    es: 'Utilizó un método no válido o accedió a una ruta no válida',
  },
  userExistsAlready: {
    en: 'User already exist, login instead',
    da: 'Brugeren findes allerede, log ind i stedet',
    fr: "L'utilisateur existe déjà, connectez-vous plutôt",
    sv: 'Användaren finns redan, logga in istället',
    es: 'El usuario ya existe, inicie sesión en su lugar',
  },
  operationFailedTryLater: {
    en: 'Operation failed, try again later',
    da: 'Operationen mislykkedes, prøv igen senere',
    fr: "L'opération a échoué, réessayez plus tard",
    sv: 'Åtgärden misslyckades, försök igen senare',
    es: 'La operación falló, inténtalo de nuevo más tarde',
  },
  accountBanned: {
    en: 'Your account has been banned, Contact us',
    da: 'Din konto er blevet udelukket, Kontakt os',
    fr: 'Votre compte a été banni, contactez-nous',
    sv: 'Ditt konto har förbjudits, kontakta oss',
    es: 'Su cuenta ha sido baneada, contáctenos',
  },
  incorrectLogin: {
    en: 'Incorrect login credentials, try again',
    da: 'Forkerte loginoplysninger, prøv igen',
    fr: "Informations d'identification de connexion incorrectes, réessayez",
    sv: 'Felaktiga inloggningsuppgifter, försök igen',
    es: 'Credenciales de inicio de sesión incorrectas, inténtelo de nuevo',
  },
  expiredToken: {
    en: 'Authentication expired, login again please',
    da: 'Autentifikation udløbet, log venligst ind igen',
    fr: "L'authentification a expiré, veuillez vous reconnecter",
    sv: 'Autentiseringen tog slut, vänligen logga in igen',
    es: 'Se agotó el tiempo de autenticación, vuelva a iniciar sesión',
  },
  authIsRequired: {
    en: 'Authentication is required',
    da: 'Autentificering er påkrævet',
    fr: "L'authentification est requise",
    sv: 'Autentisering krävs',
    es: 'Se requiere autenticacion',
  },
  invalidSession: {
    en: 'Invalid session. Kindly login',
    da: 'Ugyldig session. Log venligst ind',
    fr: 'Session invalide. Veuillez vous connecter',
    sv: 'Ogiltig session. Vänligen logga in',
    es: 'Sesión inválida. Por favor Iniciar sesión',
  },
  loggedOut: {
    en: "It's not bye bye but see you again",
    da: 'Det er ikke farvel, men vi ses igen',
    fr: "Ce n'est pas au revoir, mais à bientôt",
    sv: 'Det är inte adjö, men vi ses snart',
    es: 'No es un adiós, sino un hasta pronto.',
  },
  cityAlreadyExists: {
    en: 'City already exists',
    da: 'Byen findes allerede',
    fr: 'La ville existe déjà',
    sv: 'Staden finns redan',
    es: 'La ciudad ya existe',
  },
  cityCreatedSuccessfully: {
    en: 'City created successfully',
    da: 'Byen oprettet med succes',
    fr: 'La ville a été créée avec succès',
    sv: 'Staden skapades framgångsrikt',
    es: 'La ciudad fue creada con éxito.',
  },
  cityDoesntExist: {
    en: "City doesn't exist",
    da: 'Byen findes ikke',
    fr: "La ville n'existe pas",
    sv: 'Staden finns inte',
    es: 'la ciudad no existe',
  },
  cityUpdatedSuccessfully: {
    en: 'City updated successfully',
    da: 'Byen opdateret med succes',
    fr: 'La ville a été mise à jour avec succès',
    sv: 'Staden har uppdaterats framgångsrikt',
    es: 'La ciudad ha sido actualizada con éxito.',
  },
  cityDeletedSuccessfully: {
    en: 'City deleted successfully',
    da: 'Byen slettet med succes',
    fr: 'La ville a été supprimée avec succès',
    sv: 'Staden har raderats',
    es: 'La ciudad fue eliminada con éxito',
  },
  countryAlreadyExists: {
    en: 'Country already exists',
    da: 'Landet findes allerede',
    fr: 'Le pays existe déjà',
    sv: 'Landet finns redan',
    es: 'El país ya existe',
  },
  countryCreatedSuccessfully: {
    en: 'Country created successfully',
    da: 'Landet blev oprettet med succes',
    fr: 'Le pays a été créé avec succès',
    sv: 'Landet skapades framgångsrikt',
    es: 'El país fue creado con éxito.',
  },
  countryDoesntExist: {
    en: "Country doesn't exist",
    da: 'Landet findes ikke',
    fr: "Le pays n'existe pas",
    sv: 'Landet finns inte',
    es: 'el pais no existe',
  },
  countryUpdatedSuccessfully: {
    en: 'Country updated successfully',
    da: 'Landet opdateret med succes',
    fr: 'Le pays a été mis à jour avec succès',
    sv: 'Landet uppdaterades framgångsrikt',
    es: 'El país se actualizó con éxito.',
  },
  countryDeletedSuccessfully: {
    en: 'Country deleted successfully',
    da: 'Landet slettet med succes',
    fr: 'Le pays a été supprimé avec succès',
    sv: 'Landet har raderats',
    es: 'El país fue eliminado con éxito',
  },
  userNotFound: {
    en: 'User not found',
    da: 'Bruger ikke fundet',
    fr: 'Utilisateur non trouvé',
    sv: 'Användaren hittades inte',
    es: 'Usuario no encontrado',
  },
  userUpdatedSuccessfully: {
    en: 'User updated successfully',
    da: 'Bruger opdateret med succes',
    fr: 'Utilisateur mis à jour avec succès',
    sv: 'Användaren har uppdaterats',
    es: 'Usuario actualizado con éxito',
  },
  passwordResetSuccess: {
    en: 'Password reset successfully',
    da: 'Adgangskode nulstillet med succes',
    fr: 'Réinitialisation du mot de passe réussie',
    sv: 'Lyckad lösenordsåterställning',
    es: 'Restablecimiento de contraseña exitoso',
  },
  passwordChangeSuccess: {
    en: 'Password changed successfully',
    da: 'Adgangskode ændret med succes',
    fr: 'Mot de passe modifié avec succès',
    sv: 'lösenordet har ändrats',
    es: 'Contraseña cambiada con éxito',
  },
  newPasswordSameAsOld: {
    en: 'New password cannot be the same as the old password',
    da: 'Ny adgangskode må ikke være den samme som den gamle adgangskode',
    fr: "Le nouveau mot de passe ne peut pas être identique à l'ancien",
    sv: 'Nytt lösenord kan inte vara detsamma som det gamla lösenordet',
    es: 'La nueva contraseña no puede ser la misma que la anterior',
  },
  incorrectOldPassword: {
    en: 'Incorrect old password',
    da: 'Forkert gammel adgangskode',
    fr: 'Ancien mot de passe incorrect',
    sv: 'Felaktigt gammalt lösenord',
    es: 'Contraseña antigua incorrecta',
  },
  emailUpdateSuccess: {
    en: 'Email updated successfully',
    da: 'E-mail opdateret med succes',
    fr: 'Adresse e-mail mise à jour avec succès',
    sv: 'E-posten har uppdaterats',
    es: 'Correo electrónico actualizado con éxito',
  },
  profileUpdated: {
    en: 'Profile updated',
    da: 'Profil opdateret',
    fr: 'Profil mis à jour',
    sv: 'Profil uppdaterad',
    es: 'Perfil actualizado',
  },
  serverError: {
    en: 'Server error',
    da: 'Serverfejl',
    fr: 'Erreur de serveur',
    sv: 'Serverfel',
    es: 'Error del Servidor',
  },
  dataNotFound: {
    en: 'Data not found',
    da: 'Data ikke fundet',
    fr: 'Données non trouvées',
    sv: 'Data hittades inte',
    es: 'Datos no encontrados',
  },
  requestSuccess: {
    en: 'Request successful',
    da: 'Anmodning vellykket',
    fr: 'Requête réussie',
    sv: 'Begäran lyckades',
    es: 'Solicitud exitosa',
  },
  operationSuccess: {
    en: 'Operation successful',
    da: 'Operationen lykkedes',
    fr: 'Opération réussie',
    sv: 'Operationen lyckades',
    es: 'Operación exitosa',
  },
  internalServerError: {
    en: "Internal server error. We're duly notified and will fix this. Try again later",
    da: 'Intern serverfejl. Vi er blevet underrettet og vil rette fejlen hurtigst muligt. Prøv igen senere',
    fr: 'Erreur interne du serveur. Nous en avons été informés et résoudrons ce problème. Réessayez plus tard.',
    sv: 'Internt serverfel. Vi är vederbörligen underrättade och kommer att fixa detta. Försök igen senare',
    es: 'Error Interno del Servidor. Estamos debidamente notificados y arreglaremos esto. Vuelva a intentarlo más tarde',
  },
};

// loop through word sheet and add missing language codes with value of empty string is not present
for (const word in wordSheet) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const wordMap = wordSheet[word];
  for (const lang of languageCodes) {
    if (!wordMap[lang]) wordMap[lang] = '';
  }
}

export const useWord = (
  word: keyof typeof wordSheet,
  lang: LanguageCode = 'en'
) => {
  // wordSheet[word] ? wordSheet[word][lang] : word;
  if (wordSheet[word]) {
    const wordMap = wordSheet[word];

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (wordMap[lang]) return wordMap[lang];
    else if (wordMap.en) return wordMap.en;
    else return Object.values(wordSheet[word])[0] || '';
  } else return word;
};
