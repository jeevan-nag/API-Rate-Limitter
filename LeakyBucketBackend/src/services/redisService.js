const Redis = require("ioredis");
const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config()

const redis = new Redis({
    "host": process.env.RedisHost,
    "port": 6379       // Default Redis port
});

const API_LIMIT = 60; // Marketo limit
const WINDOW_SIZE = 20 * 1000; // 20 seconds in milliseconds

async function rateLimitCheck(orgId, connectionId) {
    const now = Date.now();
    const windowStart = now - WINDOW_SIZE;
    const rateLimitKey = `${orgId}-${connectionId}`

    // Remove old timestamps
    await redis.zremrangebyscore(rateLimitKey, 0, windowStart);

    // Count remaining requests in the window
    const currentCount = await redis.zcard(rateLimitKey);

    if (currentCount >= API_LIMIT) {
        // Find the earliest timestamp in the window to calculate wait time
        const earliestTimestamp = await redis.zrange(rateLimitKey, 0, 0, "WITHSCORES");
        if (earliestTimestamp.length > 0) {
            const waitTime = Math.max(0, WINDOW_SIZE - (now - earliestTimestamp[1]));
            return waitTime; // Return exact wait time
        }
        return 1000; // Fallback to 1 second wait if no timestamps found
    }

    // Add current timestamp to Redis
    await redis.zadd(rateLimitKey, now, now);
    return 0; // No wait needed
}

module.exports = { rateLimitCheck }
