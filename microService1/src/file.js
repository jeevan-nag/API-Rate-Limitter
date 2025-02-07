const fs = require('fs');

async function appendJsonResponse(filePath, index, newData) {
    try {
        // Step 2: Read existing data
        let existingData = [];
        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            existingData = fileContent ? JSON.parse(fileContent) : [];
        }

        // Step 3: Append new data
        existingData.push({ [index]: newData });

        // Step 4: Write updated data back to the file
        const response = fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2), 'utf-8');
        return response;
    } catch (error) {
        throw error;
    }
}

module.exports = { appendJsonResponse }

