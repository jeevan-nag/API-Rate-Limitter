const express = require("express");
const dotenv = require('dotenv');
const rateLimitter = require("./src/controller")
dotenv.config();

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 8088
app.get('/test', (req, res) => {
    try {
        return res.status(200).send({ message: 'Microservice 1 is running' })
    } catch (error) {
        return res.status(400).send({ message: error?.message })
    }
})

app.get('/invokeMarketo', async (req, res) => {
    try {
        await rateLimitter.invokeMarketo(req)
        return res.status(200).send({ message: 'Invoked to test the rate limitter 1.' })
    } catch (error) {
        return res.status(400).send({ message: error?.message })
    }
})

app.get('/invokeMarketoWithoutRateLimit', async (req, res) => {
    try {
        await rateLimitter.invokeMarketoWithoutRateLimit(req)
        return res.status(200).send({ message: 'Invoked to test the rate limitter 2 .' })
    } catch (error) {
        return res.status(400).send({ message: error?.message })
    }
})

app.listen(PORT, async () => {
    console.log(`MicroService 1 running at port ${PORT}`)
})