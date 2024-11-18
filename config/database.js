/**
 * config/database.js
 * Database configuration and connection pool setup.
 */

const mysql = require('mysql2');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    database: 'scsuforum',
    connectionLimit: 10
};

// Create the connection pool
const pool = mysql.createPool(dbConfig);

// Test the connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Database connected successfully');
    connection.release();
});

// Export promisified pool for async/await usage
module.exports = {
    pool: pool.promise()
};