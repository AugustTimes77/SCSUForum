/**
 * controllers/handlers/index.js
 * Registry of HTTP method handlers
 */

const getHandlers = require('./getHandlers');
const postHandlers = require('./postHandlers');
const putHandlers = require('./putHandlers');

// this is the handlers that is references in requestConroller
module.exports = {
    GET: getHandlers,
    POST: postHandlers,
    PUT: putHandlers
};