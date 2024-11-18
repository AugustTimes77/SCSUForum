/**
 * controllers/handlers/index.js
 * Registry of HTTP method handlers
 */

const getHandlers = require('./getHandlers');
const postHandlers = require('./postHandlers');

module.exports = {
    GET: getHandlers,
    POST: postHandlers
};