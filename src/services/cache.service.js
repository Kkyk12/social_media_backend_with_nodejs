const memoryCache = new Map();
const { getRedisClient } = require("../config/redis");

const get = async (key) => {
    const redis = await getRedisClient();
    if (redis) {
        const value = await redis.get(`cache:${key}`);
        return value ? JSON.parse(value) : null;
    }

    const entry = memoryCache.get(key);
    if (!entry || entry.expiresAt < Date.now()) {
        memoryCache.delete(key);
        return null;
    }
    return entry.value;
};

const set = async (key, value, ttlSeconds = 30) => {
    const redis = await getRedisClient();
    if (redis) {
        await redis.set(`cache:${key}`, JSON.stringify(value), { EX: ttlSeconds });
        return;
    }
    memoryCache.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
};

module.exports = { get, set };
