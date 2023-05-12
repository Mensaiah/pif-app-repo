import { promisify } from 'util';

import { createClient } from 'redis';

import appConfig from '..';
import { consoleLog } from '../../utils/helpers';

const client = createClient({
  socket: {
    port: +appConfig.redisPort,
  },
});

client.on('error', (error) => {
  consoleLog(`Redis client not connected:\n${error}`, 'error');
});

// Promisify Redis client for async/await usage
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);
const delAsync = promisify(client.del).bind(client);

const closeRedisConnection = () => {
  client.quit();
};

const redisClient = client;

export { redisClient, getAsync, setAsync, delAsync, closeRedisConnection };
