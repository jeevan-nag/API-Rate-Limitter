const { Worker, QueueScheduler, Queue } = require("bullmq");
const Redis = require("ioredis");
const axios = require("axios");

const redisConnection = new Redis({
    host: "localhost",
    port: 6379,
});

function createWorker(orgId, connectionId) {
    const queueName = `${orgId}-${connectionId}`;
    console.log(`Starting worker for ${queueName}`);
    new QueueScheduler(queueName, { connection: redisConnection });

    const worker = new Worker(
        queueName,
        async (job) => {
            console.log(`Processing API Request for ${queueName}: ${JSON.stringify(job.data)}`);

            try {
                const response = await axios.post("https://marketo.com/api", job.data);
                console.log(`API Response for ${queueName}:`, response.data);
            } catch (error) {
                console.error(`API Error for ${queueName}:`, error.response?.data || error.message);
                throw error; // Will retry based on job options
            }
        },
        {
            connection: redisConnection,
            limiter: {
                max: 100,
                duration: 20000,
            },
        }
    );
    return worker;
}

module.exports = { createWorker };
