/**
 * server.js
 * Main server entry point. Initializes HTTP server and starts listening for requests.
 */

const http = require('http');
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const app = require('./app');

const server = express();

server.use(cookieParser());
server.use(session({
    secret:'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000
    }
}));

server.use((req, res) => {
    app(req,res);
});

const port = process.env.PORT || 80;

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Server time: ${new Date().toISOString()}`);
});