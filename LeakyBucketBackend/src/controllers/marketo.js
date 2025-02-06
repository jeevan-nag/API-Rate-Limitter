const axios = require("axios");
const moment = require("moment");
const { rateLimitCheck } = require("../services/redisService")

const invokeMarketoAPI = async (req) => {
    try {
        const { url, orgId, connectionId, accessToken, startTime } = req.body;
        while (true) {
            const waitTime = await rateLimitCheck(orgId, connectionId);
            console.log({ waitTime })
            if (waitTime === 0) {
                const response = await axios.get(url, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        Accept: "application/json",
                    },
                });
                return { startTime, endTime: moment().toISOString(), data: response?.data?.requestId };
            }
            await new Promise((resolve) => setTimeout(resolve, waitTime));
        }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

module.exports = { invokeMarketoAPI }