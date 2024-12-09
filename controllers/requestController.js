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
        // Add login page route
        login: {
            pattern: /^\/login$/,
            handler: 'handlePage'
        },
        // Default handler for pages
        default: 'handlePage'
    },
    POST: {
        // Add login endpoint
        login: {
            pattern: /^\/api\/users\/login$/,
            handler: 'handleLogin'
        },
        // Add logout endpoint
        logout: {
            pattern: /^\/api\/users\/logout$/,
            handler: 'handleLogout'
        },
        createPost: {
            pattern: /^\/api\/forums\/posts\/create$/,
            handler: 'handleCreateForumPost'
        },
        api: {
            pattern: /^\/api\//,
            handler: 'handleApi'
        },
        default: null
    }
};

// Add session checking middleware
function checkSession(req) {
    // For pages that require authentication
    const protectedPaths = ['/forums/posts/create', '/account'];
    
    // If the path is protected and there's no session
    if (protectedPaths.some(path => req.url.includes(path)) && !req.session?.userId) {
        return false;
    }
    return true;
}

async function handleRequest(req, res) {
    console.log(`${req.method} request received for: ${req.url}`);

    try {
        // Check session for protected routes
        if (!checkSession(req)) {
            // If no valid session, redirect to login
            res.writeHead(302, { Location: '/login' });
            res.end();
            return;
        }

        // Get handlers for the HTTP method
        const methodHandlers = handlers[req.method];

        // No recognized handler
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

// Route matcher function (remains the same)
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

module.exports = { handleRequest };