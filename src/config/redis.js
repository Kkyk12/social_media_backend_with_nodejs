const { createClient } = require("redis");

let client = null;
let connecting = null;

const getRedisClient = async () => {
    if (!process.env.REDIS_URL) return null;
    if (client?.isReady) return client;
    if (!connecting) {
        client = createClient({ url: process.env.REDIS_URL });
        client.on("error", (error) => console.error("Redis error:", error.message));
        connecting = client.connect().catch((error) => {
            connecting = null;
            console.error("Redis connection error:", error.message);
            return null;
        });
    }
    await connecting;
    return client?.isReady ? client : null;
};

module.exports = { getRedisClient };
