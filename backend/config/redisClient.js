import { createClient } from 'redis';

// Create the Redis client
const redisClient = createClient();

// Event listener for when the client connects to the Redis server
redisClient.on('connect', () => {
  console.log('✅ Connected to Redis...');
});

// Event listener for any errors that occur
redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

// Immediately connect to the Redis server
(async () => {
  await redisClient.connect();
})();

export default redisClient;