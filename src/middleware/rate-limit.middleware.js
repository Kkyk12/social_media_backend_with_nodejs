const rateLimit = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const { createClient } = require("redis");

let redisStore;
if (process.env.REDIS_URL) {
    const redisClient = createClient({ url: process.env.REDIS_URL });
    redisClient.on("error", (error) => console.error("Redis rate-limit error:", error.message));
    redisClient.connect().catch(() => {});
    redisStore = new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
    });
}

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,

    max: 10,

    message: {
        message: "Too many login attempts. Try again later."
    },

    standardHeaders: true,
    legacyHeaders: false,
    ...(redisStore ? { store: redisStore } : {})
});

module.exports = {
    loginLimiter
};