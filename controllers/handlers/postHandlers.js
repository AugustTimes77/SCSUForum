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
    },

    async handleLogin(req, res) {
        try {
            const userData = await parseBody(req);
            
            // For a student project, we'll do simple password checking
            const [user] = await db.pool.query(
                'SELECT user_id, username, email, role FROM users WHERE username = ? AND password_hash = ?',
                [userData.username, userData.password]
            );

            if (!user || user.length === 0) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid username or password' }));
                return;
            }

            // Set session data
            req.session.userId = user[0].user_id;
            req.session.username = user[0].username;
            
            res.writeHead(200, { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify({ 
                success: true,
                user: {
                    id: user[0].user_id,
                    username: user[0].username,
                    email: user[0].email,
                    role: user[0].role
                }
            }));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Login failed' }));
        }
    }

};

module.exports = postHandlers;