const axios = require('axios');
const moment = require('moment');
const { config } = require("../config");
const fs = require('fs').promises;
const { appendJsonResponse } = require("./file");

const invokeMarketo = async (req) => {
    try {
        const payload = {
            ...req.query
        }
        payload.endPoint = '/getMarketoDetails';
        await testRateLimitter(payload);
        return true;
    } catch (error) {
        throw errow;
    }
}

const invokeMarketoWithoutRateLimit = async (req) => {
    try {
        const payload = {
            ...req.query
        }
        payload.endPoint = '/getMarketoDetailsWithoutRateLimit';
        await testRateLimitter(payload);
        return true;
    } catch (error) {
        throw errow;
    }
}
const testRateLimitter = async (data) => {
    try {
        const { url, connectionId, orgId, accessToken, filePath, endPoint = '' } = data;
        if (!url || !connectionId || !orgId || !accessToken) {
            throw new Error("Invalid Data");
        }
        const payload = {
            url, connectionId, orgId, accessToken, startTime: moment().toISOString()
        }
        fs.writeFile(filePath, JSON.stringify([], null, 2), 'utf-8');
        const baseUrl = `${config.Leaky_Bucket_Backend_BaseURL}${endPoint}`;
        const requests = Array.from({ length: 500 }, (_, i) => {
            payload.index = i;
            const response = axios.post(baseUrl, payload)
                .then(response => appendJsonResponse(filePath, i, response?.data?.data))
                .catch(error => {
                    appendJsonResponse(filePath, i, error?.message)
                    console.error(`Error on request ${i}:`, error)
                })
            return response;
        }
        );

        await Promise.allSettled(requests);
        await reWriteFile(filePath);
        return true;
    } catch (error) {
        throw error;
    }
}

const reWriteFile = async (filePath) => {
    try {
        const data = await fs.readFile(`./${filePath}`, 'utf-8');

        // Step 2: Parse the JSON data
        const parsedData = JSON.parse(data);

        // Step 3: Sort the array based on the numeric keys
        const sortedData = parsedData.sort((a, b) => {
            const keyA = Number(Object.keys(a)[0]);
            const keyB = Number(Object.keys(b)[0]);
            return keyA - keyB;
        });

        // Step 4: Write the sorted data back to the file
        await fs.writeFile(filePath, JSON.stringify(sortedData, null, 2), 'utf-8');
    } catch (error) {
        throw error;
    }

}

module.exports = { invokeMarketo, invokeMarketoWithoutRateLimit }