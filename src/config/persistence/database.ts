import mongoose from 'mongoose';

import appConfig from '..';
import { consoleLog } from '../../utils/helpers';

export async function connectMongoDb(): Promise<void> {
  try {
    if (appConfig.isDev) mongoose.set('debug', true);
    await mongoose.connect(appConfig.mongoDbURI);

    consoleLog('Database connected');
  } catch (error) {
    consoleLog('Error connecting to database:' + error, 'error');
    process.exit(1);
  }

  // Listen for errors after the initial connection
  mongoose.connection.on('error', (error) => {
    consoleLog('Database error:' + error, 'error');
  });
}

export async function closeMongoDb(): Promise<void> {
  await mongoose.disconnect();
  consoleLog('Database disconnected');
}
