const express = require('express');
const dotenv = require('dotenv');
const app = express();
dotenv.config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process?.env?.PORT || 8080;

app.get("/test", (req, res) => {
    res.status(200).send({ message: `API Rate Limitter Backend is running @ ${PORT}` });
})

app.post("/testRateLimitter", (req,))

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})