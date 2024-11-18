/**
 * app.js
 * Application setup and configuration. Exports the main request handler.
 */

const { handleRequest } = require('./controllers/requestController');

// Error handling wrapper for all requests
async function applicationHandler(req, res) {
    try {
        await handleRequest(req, res);
    } catch (error) {
        console.error('Unhandled error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal Server Error' }));
    }
}

module.exports = applicationHandler;