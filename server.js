/**
 * server.js
 * Main server entry point. Initializes HTTP server and starts listening for requests.
 */

const http = require('http');
const app = require('./app');

const port = process.env.PORT || 80;
const server = http.createServer(app);

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Server time: ${new Date().toISOString()}`);
});