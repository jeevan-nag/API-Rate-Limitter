const axios = require("axios");
const axiosRetry = require("axios-retry").default;
const moment = require("moment");
const { rateLimitCheck } = require("../services/redisService")
const axiosInstance = axios.create({
    timeout: 30000, // 30 seconds
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
    try {
        const { url, orgId, connectionId, accessToken, startTime } = req.body;
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
                    return { startTime, endTime: moment().toISOString(), data: response?.data?.requestId };
                } else {
                    if (response?.data?.errors?.[0]?.message == "Max rate limit '100' exceeded with in '20' secs") {
                        const waitTime = await rateLimitCheck(orgId, connectionId);
                        await new Promise((resolve) => setTimeout(resolve, waitTime));
                        console.log(response?.data?.errors?.[0]?.message, "----->", waitTime)
                        return await invokeMarketoWithoutRateLimit(req)
                    }
                    return { startTime, endTime: moment().toISOString(), error: JSON.stringify(response?.data?.errors) };
                }
            }
            await new Promise((resolve) => setTimeout(resolve, waitTime));
        }
    } catch (error) {

        throw error;
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
            if (response?.data?.errors?.[0]?.message == "Max rate limit '100' exceeded with in '20' secs") {
                return await invokeMarketoWithoutRateLimit(req)
            }
            return { startTime, endTime: moment().toISOString(), error: JSON.stringify(response?.data?.errors) };
        }

    } catch (error) {
        return { startTime, endTime: moment().toISOString(), error: error?.message };
    }
}

module.exports = { invokeMarketoAPI, invokeMarketoWithoutRateLimit }