// controllers/requestController.js
const handlers = require('./handlers');

// Route definitions mapping URLs to handler functions
const routes = {
    GET: {
        static: {
            pattern: /\.(css|js|png|jpg|gif|ico)$/,
            handler: 'handleStaticFile'
        },
        partial: {
            pattern: /^\/partial\//,
            handler: 'handlePartial'
        },
        api: {
            pattern: /^\/api\//,
            handler: 'handleApi'
        },
        template: {
            pattern: /^\/templates\//,
            handler: 'handleTemplate'
        },
        forum: {
            pattern: /^\/forum\/([^/]+)$/,
            handler: 'handleForum'
        },
        // Default handler for pages
        default: 'handlePage'
    },
    POST: {
        api: {
            pattern: /^\/api\//,
            handler: 'handleApi'
        },
        // Add more POST routes as needed
        default: null
    }
};

// Route matcher function
function findRoute(method, url) {
    const methodRoutes = routes[method];
    if (!methodRoutes) return null;

    // Check each defined route pattern
    for (const [key, route] of Object.entries(methodRoutes)) {
        if (key === 'default') continue;
        if (route.pattern.test(url)) {
            return route.handler;
        }
    }

    // Return default handler if no specific route matches
    return methodRoutes.default;
}

async function handleRequest(req, res) {
    console.log(`${req.method} request received for: ${req.url}`);

    try {
        // Get handlers for the HTTP method
        const methodHandlers = handlers[req.method];
        if (!methodHandlers) {
            res.writeHead(405);
            res.end('Method Not Allowed');
            return;
        }

        // Find matching route handler
        const handlerName = findRoute(req.method, req.url);
        if (!handlerName) {
            res.writeHead(404);
            res.end('Not Found');
            return;
        }

        // Execute the handler
        const handler = methodHandlers[handlerName];
        await handler(req, res);

    } catch (error) {
        console.error('Request handling error:', error);
        res.writeHead(500);
        res.end('Internal Server Error');
    }
}

module.exports = { handleRequest };