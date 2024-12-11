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
    
    async handleApi(req, res) {
        try {
            // Define API routes
            const routes = {
                '/api/users/create': this.handleCreateUser,
                '/api/forums/posts/create': this.handleCreateForumPost,
                '/api/forums/create': this.handleCreateForum  // Add this line
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
            console.log('Login attempt for user:', userData.username); // Debug log
            
            // Validate input
            if (!userData.username || !userData.password) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Username and password are required' }));
                return;
            }

            try {
                // Use the pool directly since we're debugging
                const [rows] = await pool.query(
                    'SELECT user_id, username, email, role FROM users WHERE username = ? AND password_hash = ?',
                    [userData.username, userData.password]
                );
                
                console.log('Query result:', rows); // Debug log

                if (!rows || rows.length === 0) {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Invalid username or password' }));
                    return;
                }

                const user = rows[0];

                // Set session data
                req.session = req.session || {};
                req.session.user = {
                    id: user.user_id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                };

                res.writeHead(200, { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                });
                res.end(JSON.stringify({ 
                    success: true,
                    user: {
                        id: user.user_id,
                        username: user.username,
                        email: user.email,
                        role: user.role
                    }
                }));

            } catch (dbError) {
                console.error('Database error:', dbError);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Database error during login' }));
            }

        } catch (error) {
            console.error('Login error:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Login failed', details: error.message }));
        }
    },

    async handleLogout(req, res) {
        try {
            req.session.destroy(err => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Logout failed' }));
                    return;
                }
    
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            });
        } catch (error) {
            console.error('Logout error:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Logout failed' }));
        }
    },

    async handleCreateForum(req, res) {
        try {
            const forumData = await parseBody(req);
            
            if (!forumData.name || !forumData.description) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Name and description are required' }));
                return;
            }
    
            const newForum = await Forum.create(forumData);
            
            res.writeHead(201, { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify({
                success: true,
                forum: newForum
            }));
        } catch (error) {
            console.error('Error creating forum:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to create forum' }));
        }
    }

};

module.exports = postHandlers;