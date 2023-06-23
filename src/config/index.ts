/* eslint-disable no-console */

import { allPermissions, permissionList } from './platformPermissionList';

/* eslint-disable @typescript-eslint/no-var-requires */
const ms = require('ms');

require('dotenv/config');

const env = process.env;

const appConfig = {
  port: env.PORT || 3000,
  environment: env.NODE_ENV || 'dev',
  isDev:
    env.NODE_ENV === 'dev' || env.NODE_ENV === 'development' || !env.NODE_ENV,
  isProd: env.NODE_ENV === 'prod' || env.NODE_ENV === 'production',
  isStaging: env.NODE_ENV === 'staging',
  isTesting: env.NODE_ENV === 'testing',
  mongoDbURI: env.MONGODB_URL || '',
  redisUrl: env.REDIS_URL || '',
  redisPort: env.REDIS_PORT || '',
  firebaseConfig: {
    apiKey: env.FIREBASE_API_KEY || '',
    authDomain: env.FIREBASE_AUTH_DOMAIN || '',
    projectId: env.FIREBASE_PROJECT_ID || '',
    storageBucket: env.FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID || '',
    appId: env.FIREBASE_APP_ID || '',
    measurementId: env.FIREBASE_MEASUREMENT_ID || '',
  },
  firebaseServiceAccount: {
    projectId: env.FIREBASE_PROJECT_ID || '',
    clientEmail: env.FIREBASE_CLIENT_EMAIL || '',
    privateKey: env.FIREBASE_PRIVATE_KEY || '',
  },
  firebaseDatabaseUrl: env.FIREBASE_DATABASE_URL || '',
  authConfigs: {
    saltRounds: 10,
    tokenLifespan: ms('3 days'),
    maxInactivity: '3 hours',
    sessionLivespan: '2 days',
    jwtSecret: env.JWT_SECRET || 'UBUI2ZH22NH@IHI@2BB222',
    permissionList,
    allPermissions,
  },
  supportedLanguages: ['en', 'da'] as const,
  paginationConfig: {
    perPage: 20,
    allowedPerPageValues: [20, 30, 50, 100],
  },
  seedData: {
    name: env.SEED_USER_NAME,
    email: env.SEED_USER_EMAIL,
    contact: {
      phonePrefix: env.SEED_USER_PHONE_PREFIX,
      phone: env.SEED_USER_PHONE,
    },
    password: env.SEED_USER_PASSWORD,
  },
  mailgunConfigs: {
    apiKey: env.MAILGUN_API_KEY || '',
    url: env.MAILGUN_DOMAIN || '',
  },
  infobipBaseUrl: env.INFOBIP_BASE_URL || '',
  infoBipApiKey: env.INFOBIP_API_KEY || '',
  reCaptchaPublicKey: env.reCAPTCHA_PUBLIC_KEY || '',
  reCaptchaSecretKey: env.reCAPTCHA_SECRET_KEY || '',
  spacesConfigs: {
    key: env.SPACES_KEY || '',
    secret: env.SPACES_SECRET || '',
    region: env.SPACES_REGION || '',
    endpoint: env.SPACES_ENDPOINT || '',
  },
};

export default appConfig;
module.exports = appConfig;
