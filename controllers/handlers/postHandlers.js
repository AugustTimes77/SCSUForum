/**
 * controllers/handlers/postHandlers.js
 * Handles all POST requests with separate handlers for different endpoints
 */

const { pool } = require('../../config/database');

const User = require('../../models/User');
const Forum = require('../../models/Forum');

// Helper to parse request body
const parseBody = (req) => {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                resolve(JSON.parse(body));
            } catch (error) {
                reject(new Error('Invalid JSON'));
            }
        });
    });
};

const postHandlers = {
    // User-related handlers
    async handleCreateUser(req, res) {
        try {
            const userData = await parseBody(req);
            const newUser = await User.create(userData);
            
            res.writeHead(200, { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify({ 
                message: 'User created successfully',
                userId: newUser.insertId 
            }));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Error creating user' }));
        }
    },
    // Main API router
    async handleApi(req, res) {
        try {
            // Define API routes
            const routes = {
                '/api/users/create': this.handleCreateUser,
                '/api/forums/posts/create': this.handleCreateForumPost
            };

            const handler = routes[req.url];
            if (handler) {
                await handler.call(this, req, res);
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'API endpoint not found' }));
            }
        } catch (error) {
            console.error('Error in handleApi:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal server error' }));
        }
    },
    async handleCreateForumPost(req, res) {
        try {
            const postData = await parseBody(req);
            
            // Validate required fields
            if (!postData.title || !postData.content || !postData.forum_id || !postData.user_id) {
                res.writeHead(400, { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                });
                res.end(JSON.stringify({ 
                    error: 'Missing required fields',
                    required: ['title', 'content', 'forum_id', 'user_id']
                }));
                return;
            }

            const result = await Forum.createPost(postData);
            
            res.writeHead(201, { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify({
                success: true,
                message: 'Post created successfully',
                post: result
            }));
        } catch (error) {
            console.error('Error in handleCreateForumPost:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                error: 'Failed to create post',
                message: error.message
            }));
        }
    }

};

module.exports = postHandlers;