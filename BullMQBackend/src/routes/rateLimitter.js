const express = require('express');
const router = express.Router();

const rateLimitter = require("../controllers/rateLimitter")

router.post('/testRateLimitter', rateLimitter.sendRequest);