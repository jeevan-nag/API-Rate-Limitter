const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const app = express();
app.use(express.json());
const marketoController = require("./src/controllers/marketo")

const PORT = process.env.PORT || 8080;

app.get('/test', async (req, res) => {
    try {
        return res.status(200).send({ message: 'Leaky Bucket Backend is running' })
    } catch (error) {
        return res.status(400).send({ message: error?.message })
    }
})

app.post("/getMarketoDetails", async (req, res) => {
    try {
        console.log({ index: req.body.index })
        const response = await marketoController.invokeMarketoAPI(req);
        return res.status(200).send({ success: true, data: response });
    } catch (error) {
        return res.status(400).send({ message: error?.message })
    }
})

app.listen(PORT, () => {
    console.log(`Leaky Bucket Backend is running at port, ${PORT}`)
})