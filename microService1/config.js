const dotenv = require('dotenv');
dotenv.config();

const config = {
    Leaky_Bucket_Backend_BaseURL: process.env.Leaky_Bucket_Backend_BaseURL || 'http://localhost:8080',
    dbCredentials: {
        host: process.env.host,
        database: process.env.database,
        user: process.env.user,
        password: process.env.password
    }
}

module.exports = { config }
