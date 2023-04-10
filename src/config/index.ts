import "dotenv/config";

const appConfig = {
  port: process.env.PORT || 3000,
  environment: process.env.NODE_ENV || "dev",
  databaseUrl: process.env.DATABASE_URL || "",
  redisUrl: process.env.REDIS_URL || "",
  firebaseConfig: {
    apiKey: process.env.FIREBASE_API_KEY || "",
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || "",
    projectId: process.env.FIREBASE_PROJECT_ID || "",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "",
    appId: process.env.FIREBASE_APP_ID || "",
    measurementId: process.env.FIREBASE_MEASUREMENT_ID || "",
  },
  firebaseServiceAccount: {
    projectId: process.env.FIREBASE_PROJECT_ID || "",
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || "",
    privateKey: process.env.FIREBASE_PRIVATE_KEY || "",
  },
  firebaseDatabaseUrl: process.env.FIREBASE_DATABASE_URL || "",
  jwtSecret: process.env.JWT_SECRET || "",
};

export default appConfig;
module.exports = appConfig;
