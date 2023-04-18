import mongoose from 'mongoose';
import appConfig from '../config';
import { consoleLog } from './helpers';

export async function connectDb(): Promise<void> {
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

export async function closeDb(): Promise<void> {
  await mongoose.disconnect();
  consoleLog('Database disconnected');
}
