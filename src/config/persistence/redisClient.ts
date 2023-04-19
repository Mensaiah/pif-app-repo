import { createClient } from 'redis';
import { consoleLog } from 'src/utils/helpers';
import { promisify } from 'util';

const client = createClient({
  socket: {
    port: 6379,
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
