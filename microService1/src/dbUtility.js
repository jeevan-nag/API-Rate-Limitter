
const { createPool } = require('mysql')
const util = require('util');
const { config } = require("../config")

const pool = createPool({
    host: config.dbCredentials.host,
    user: config.dbCredentials.user,
    password: config.dbCredentials.password,
    database: config.dbCredentials.database,
    charset: 'utf8mb4',
    connectionLimit: 1000,
    connectTimeout: 60 * 60 * 1000,
    acquireTimeout: 60 * 60 * 1000,
    timeout: 60 * 60 * 1000,
});

const query = util.promisify(pool.query).bind(pool);

/**
 * Executes a SQL query against the database with optional parameters.
 *
 * @param queryStatement - The SQL query string to be executed.
 * @param params - An optional array of parameters to be bound to the query.
 *                 If no parameters are needed, this can be omitted or passed as an empty array.
 * @returns A promise that resolves to the result of the query execution.
 * @throws Throws an error if there is a problem executing the query.
 */
const executeQuery = async (queryStatement, params) => {
    try {
        let result;

        // Check if parameters are provided and execute the query accordingly.
        if (params && params.length > 0) {
            result = await query({ sql: queryStatement, values: params });
        } else {
            result = await query(queryStatement);
        }

        // Return the result of the query execution.
        return result;
    } catch (err) {
        // Log the error message for debugging purposes.
        console.error('Error in db.executeQuery service', err);

        // Throw the error to be handled by the calling function.
        throw err;
    }
};

