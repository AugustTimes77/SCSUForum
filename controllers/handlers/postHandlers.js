/**
 * controllers/handlers/postHandlers.js
 * Handles all POST requests
 */

const User = require('../../models/User');

const postHandlers = {
    async handleApi(req, res) {
        if (req.url === '/api/users/create') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            
            req.on('end', async () => {
                try {
                    const userData = JSON.parse(body);
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
            });
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'API endpoint not found' }));
        }
    }
};

module.exports = postHandlers;