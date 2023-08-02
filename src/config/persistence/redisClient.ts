import { promisify } from 'util';

import { createClient } from 'redis';

import appConfig from '..';
import { consoleLog } from '../../utils/helpers';

const client = createClient({
  password: appConfig.redisPassword,
  socket: {
    host: appConfig.redisUrl,
    port: +appConfig.redisPort,
  },
});

client.on('error', (error) => {
  consoleLog(`Redis client not connected:\n${error}`, 'error');
});

// Promisify Redis client for async/await usage
const redisGetAsync = promisify(client.get).bind(client);
const redisSetAsync = promisify(client.set).bind(client);
const redisDelAsync = promisify(client.del).bind(client);

const closeRedisConnection = () => {
  client.quit();
};

const redisClient = client;

export {
  redisClient,
  redisGetAsync,
  redisSetAsync,
  redisDelAsync,
  closeRedisConnection,
};
