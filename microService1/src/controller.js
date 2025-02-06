const axios = require('axios');
const moment = require('moment');
const { config } = require("../config");
const fs = require('fs').promises;
const { appendJsonResponse } = require("./file");

const testRateLimitter1 = async (req) => {
    try {
        const { url, connectionId, orgId, accessToken, filePath } = req.query;
        if (!url || !connectionId || !orgId || !accessToken) {
            throw new Error("Invalid Data");
        }
        const payload = {
            url, connectionId, orgId, accessToken, startTime: moment().toISOString()
        }
        try {
            fs.writeFile(filePath, JSON.stringify([], null, 2), 'utf-8');
        } catch (error) {
            console.log(error);
        }

        const baseUrl = `${config.Leaky_Bucket_Backend_BaseURL}/getMarketoDetails`;
        const requests = Array.from({ length: 1000 }, (_, i) => {
            payload.index = i;
            const response = axios.post(baseUrl, payload)
                .then(response => appendJsonResponse(filePath, i, response?.data?.data))
                .catch(error => console.error(`Error on request ${i}:`, error))
            return response;
        }
        );

        await Promise.allSettled(requests);
        await reWriteFile(filePath);
        return true;
    } catch (error) {
        console.log(error);
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

module.exports = { testRateLimitter1 }