import { google, plus_v1 } from 'googleapis';

import appConfig from '../../../../config';
import { consoleLog } from '../../../../utils/helpers';

/*******************/
/** CONFIGURATION **/
/*******************/

const googleConfig = {
  clientId: appConfig.googleClientId,
  clientSecret: appConfig.googleClientSecret,
  redirect: appConfig.googleRedirectUrl,
};
consoleLog({ googleConfig });

const defaultScope: string[] = [
  'https://www.googleapis.com/auth/plus.me',
  'https://www.googleapis.com/auth/userinfo.email',
];

/*************/
/** HELPERS **/
/*************/

const createConnection = () =>
  new google.auth.OAuth2(
    googleConfig.clientId,
    googleConfig.clientSecret,
    googleConfig.redirect
  );

const getConnectionUrl = (
  auth: InstanceType<typeof google.auth.OAuth2>
): string =>
  auth.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: defaultScope,
  });

const getGooglePlusApi = (auth: InstanceType<typeof google.auth.OAuth2>) =>
  google.plus({ version: 'v1', auth });

/**********/
/** MAIN **/
/**********/

/**
 * Part 1: Create a Google URL and send to the client to log in the user.
 */
export const urlGoogle = (): string => {
  const auth = createConnection();
  return getConnectionUrl(auth);
};

/**
 * Part 2: Take the "code" parameter which Google gives us once when the user logs in, then get the user's email and id.
 */
export const getGoogleAccountFromCode = async (code: string) => {
  const auth = createConnection();
  const data = await auth.getToken(code);
  const tokens = data.tokens;
  auth.setCredentials(tokens);
  const plus = getGooglePlusApi(auth);
  const me = await plus.people.get({ userId: 'me' });
  const userGoogleId = me.data.id;
  const userGoogleEmail =
    me.data.emails && me.data.emails.length && me.data.emails[0].value;
  return {
    id: userGoogleId,
    email: userGoogleEmail,
    tokens: tokens,
  };
};
