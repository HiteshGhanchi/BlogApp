const redis = require('redis');
require('dotenv').config();

const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

console.log('Connecting to Redis at:', process.env.REDIS_URL || 'redis://localhost:6379');

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis Connected'));

const connectRedis = async () => {
    try {
        await redisClient.connect();
    } catch (e) {
        console.error('Failed to connect to Redis', e);
    }
};

connectRedis();

module.exports = redisClient;
