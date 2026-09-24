const memoryPresence = new Map();
const { getRedisClient } = require("../config/redis");

const setPresence = async (userId, isOnline) => {
    const value = { isOnline, lastSeen: new Date().toISOString() };
    memoryPresence.set(String(userId), value);
    const redis = await getRedisClient();
    if (redis) await redis.set(`presence:${userId}`, JSON.stringify(value), { EX: 86400 });
    return value;
};

const getPresence = async (userId) => {
    const redis = await getRedisClient();
    if (redis) {
        const value = await redis.get(`presence:${userId}`);
        if (value) return JSON.parse(value);
    }
    return memoryPresence.get(String(userId)) || null;
};

module.exports = { setPresence, getPresence };
