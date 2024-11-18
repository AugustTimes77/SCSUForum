/**
 * controllers/requestController.js
 * Routes requests to appropriate handlers based on HTTP method
 */

const handlers = require('./handlers');

async function handleRequest(req, res) {
    console.log(`${req.method} request received for: ${req.url}`);

    const methodHandlers = handlers[req.method];
    if (!methodHandlers) {
        res.writeHead(405);
        res.end('Method Not Allowed');
        return;
    }

    try {
        // route based on URL pattern
        if (req.url.match(/\.(css|js|png|jpg|gif|ico)$/)) {
            await methodHandlers.handleStaticFile(req, res);
        }
        else if (req.url.startsWith('/partial/')) {
            await methodHandlers.handlePartial(req, res);
        }
        else if (req.url.startsWith('/api/')) {
            await methodHandlers.handleApi(req, res);
        }
        else if (req.url.startsWith('/templates/')) {
            await methodHandlers.handleTemplate(req, res);
        }
        else {
            await methodHandlers.handlePage(req, res);
        }
    } catch (error) {
        console.error('Request handling error:', error);
        res.writeHead(500);
        res.end('Internal Server Error');
    }
}

module.exports = { handleRequest };