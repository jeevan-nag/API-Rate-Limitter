const { addRequestToQueue } = require("../services/rateLimitter");

const sendRequest = async (req, res) => {
    try {
        const { orgId = '', connectionId = '', data = '' } = req.body;
        const response = await addRequestToQueue(orgId, connectionId, data);
        console.log("Request added to queue.", response);
        return res.status(200).send({ message: 'Valid' });
    } catch (error) {
        console.log(error);
        throw error;
    }
}

module.exports = { sendRequest }



