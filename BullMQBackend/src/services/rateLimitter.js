const { Queue } = require("bullmq");
const Redis = require("ioredis");

const redisConnection = new Redis({
    host: "localhost", // Update as needed
    port: 6379,
});

async function addRequestToQueue(orgId, connectionId, data) {
    try {
        const api_queue = new Queue(`${orgId}-${connectionId}`, { connection: redisConnection });
        await api_queue.add("api_call", payload, {
            removeOnComplete: true,  // Keep Redis clean   
            removeOnFail: { age: 86400, count: 100 }   // Keep failed jobs for debugging
        });
    } catch (error) {
        console.log(error);
        throw error;
    }
}

module.exports = { addRequestToQueue };
