import mongoose from 'mongoose';

import { consoleLog } from 'src/utils/helpers';
import appConfig from '..';

export async function connectMongoDb(): Promise<void> {
  try {
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
