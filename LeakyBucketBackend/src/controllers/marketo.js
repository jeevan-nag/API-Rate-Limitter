const axios = require("axios");
const axiosRetry = require("axios-retry").default;
const moment = require("moment");
const { rateLimitCheck } = require("../services/redisService")
const axiosInstance = axios.create({
    timeout: 10 * 60 * 1000, // 30 seconds
});

axiosRetry(axiosInstance, {
    retries: 3, // Retry 3 times before failing
    retryDelay: axiosRetry.exponentialDelay, // Use exponential backoff
    retryCondition: (error) => {
        // Retry only if request times out or server errors (5xx)
        return error.code === "ETIMEDOUT" || error.response?.status >= 500;
    },
});

const invokeMarketoAPI = async (req) => {
    const { url, orgId, connectionId, accessToken, startTime } = req.body;
    try {

        while (true) {
            const waitTime = await rateLimitCheck(orgId, connectionId);
            if (waitTime === 0) {
                const response = await axiosInstance.get(url, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        Accept: "application/json",
                    },
                });
                if (response?.data?.success) {
                    return { startTime, endTime: moment().toISOString(), data: JSON.stringify(response?.data) };
                } else {
                    if (response?.data?.errors?.[0].code == "606") {
                        const waitTime = await rateLimitCheck(orgId, connectionId);
                        await new Promise((resolve) => setTimeout(resolve, waitTime));
                        const retryResponse = await invokeMarketoAPI(req)
                        return retryResponse;
                    } else {
                        console.log({ response });
                        return { startTime, endTime: moment().toISOString(), error: JSON.stringify(response?.data?.errors) };
                    }

                }
            }
            await new Promise((resolve) => setTimeout(resolve, waitTime));
        }
    } catch (error) {
        if (error.code == 'ETIMEDOUT' || 'ECONNRESET') {
            const waitTime = await rateLimitCheck(orgId, connectionId);
            await new Promise((resolve) => setTimeout(resolve, waitTime));
            const retryResponse = await invokeMarketoAPI(req);
            return retryResponse;
        } else {
            console.log({ error });
            return { startTime, endTime: moment().toISOString(), error: error?.message };
        }
    }
}

const invokeMarketoWithoutRateLimit = async (req) => {
    const { url, accessToken, startTime } = req.body;
    try {
        const response = await axiosInstance.get(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/json",
            },
        });
        if (response?.data?.success) {
            return { startTime, endTime: moment().toISOString(), data: response?.data?.requestId };
        } else {
            return { startTime, endTime: moment().toISOString(), error: JSON.stringify(response?.data?.errors) };
        }

    } catch (error) {
        return { startTime, endTime: moment().toISOString(), error: error?.message };
    }
}

module.exports = { invokeMarketoAPI, invokeMarketoWithoutRateLimit }