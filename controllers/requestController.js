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
        login: {
            pattern: /^\/login$/,
            handler: 'handlePage'
        },
        // Default handler for pages
        default: 'handlePage'
    },
    POST: {
        createUser: {
            pattern: /^\/api\/users\/create$/,
            handler: 'handleCreateUser'
        },
        login: {
            pattern: /^\/api\/users\/login$/,
            handler: 'handleLogin'
        },
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
        createForum: {
            pattern: /^\/api\/forums\/create$/,
            handler: 'handleApi'
        },
        default: null
    },
    PUT: {
        postReaction: {
            pattern: /^\/api\/posts\/react$/,
            handler: 'handlePostReaction'
        }
    },
    DELETE: {
        deletePost: {
            pattern: /^\/api\/posts\/\d+$/,
            handler: 'handleDeletePost'
        }
    }
};

// Add session checking middleware
function checkSession(req) {
    // Public paths that don't require authentication
    const publicPaths = ['/login', '/account', '/', '/css/', '/js/', '/api/users/login'];
    
    if (publicPaths.some(path => req.url.startsWith(path))) {
        return true;
    }

    // Check if user is logged in
    return req.session && req.session.user;
}

async function handleRequest(req, res) {
    console.log(`${req.method} request received for: ${req.url}`);

    try {
        // Check session for protected routes
        if (!checkSession(req)) {
            if (req.url.startsWith('/api/')) {
                // For API requests, return JSON error
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Unauthorized' }));
            } else {
                // For page requests, redirect to login
                res.writeHead(302, { Location: '/login' });
                res.end();
            }
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