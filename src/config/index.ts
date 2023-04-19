/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-var-requires */
const chalk = require('chalk');
const ms = require('ms');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Determine the appropriate .env file based on NODE_ENV
let envFile = '.env';
let nodeEnv = process.env.NODE_ENV;

if (nodeEnv === 'prod' || nodeEnv === 'production') {
  if (fs.existsSync(path.resolve(__dirname, '..', '..', '.env.prod'))) {
    envFile = '.env.prod';
  }
} else if (nodeEnv === 'staging') {
  if (fs.existsSync(path.resolve(__dirname, '..', '..', '.env.staging'))) {
    envFile = '.env.staging';
  }
} else if (nodeEnv === 'test') {
  envFile = '.env.test';
} else {
  nodeEnv = 'dev';
}

console.log(`Using ${envFile} for environment variables`);

// Load environment variables from the specified file
const result = dotenv.config({
  path: path.resolve(__dirname, '..', '..', envFile),
});

if (result.error) {
  console.error('Error loading environment variables: ' + result.error);
  console.error(
    chalk.hex('#4527a0')(
      "\nIf .env doesn't exist at the root, simply;\n \n1) duplicate .env.example \n2) rename to .env \n3) Set environment variable. \n\n"
    ) +
      chalk.bgWhite(
        'Reach out to the team lead if you have any further questions.'
      )
  );
  process.exit(1);
}
const env = process.env;

const appConfig = {
  port: env.PORT || 3000,
  environment: env.NODE_ENV || 'dev',
  isDev: env.NODE_ENV === 'dev' || env.NODE_ENV === 'dev',
  isProd: env.NODE_ENV === 'prod' || env.NODE_ENV === 'production',
  isStaging: env.NODE_ENV === 'staging',
  isTesting: env.NODE_ENV === 'testing',
  mongoDbURI: env.MONGODB_URL || '',
  redisUrl: env.REDIS_URL || '',
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
    saltRounds: env.SALT_ROUNDS || 10,
    tokenLifespan: env.TOKEN_LIFESPAN || ms('3 days'),
    maxInactivity: '30 mins',
    sessionLivespan: '2 days',
    jwtSecret: env.JWT_SECRET || 'UBUI2ZH22NH@IHI@2BB222',
  },
  supportedLanguages: ['en', 'da', 'fr'] as const,
  paginationConfig: {
    perPage: 20,
    allowedPerPageValues: [20, 30, 50, 100],
  },
  seedData: {
    firstName: env.SEED_USER_FIRSTNAME,
    lastName: env.SEED_USER_LASTNAME,
    email: env.SEED_USER_EMAIL,
    contact: {
      phone: env.SEED_USER_PHONE,
      country: env.SEED_USER_COUNTRY,
      city: env.SEED_USER_CITY,
      callingCode: env.SEED_USER_CALLING_CODE,
    },
  },
  mailgunConfigs: {
    apiKey: env.MAILGUN_API_KEY || '',
    url: 'https://api.mailgun.net/v3/auto.pi-app.asia',
  },
};

export default appConfig;
module.exports = appConfig;
