/**
 * controllers/handlers/getHandlers.js
 * Handles all GET requests
 */

const path = require('path');
const fs = require('fs').promises;
const mimeTypes = require('../../utils/mimeTypes');
const templateService = require('../../services/templateService');
const User = require('../../models/User');
const Forum = require('../../models/Forum');

const getHandlers = {
    async handleStaticFile(req, res) {
        try {
            const filePath = path.join(__dirname, '../../public', req.url);
            const extname = path.extname(filePath).toLowerCase();
            const contentType = mimeTypes[extname] || 'application/octet-stream';

            const content = await fs.readFile(filePath);
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        } catch (error) {
            res.writeHead(404);
            res.end('File not found');
        }
    },

    async handlePartial(req, res) {
        try {
            const requestedPath = req.url.split('/partial/')[1];
            console.log('Loading partial/template:', requestedPath);
            
            let content;
            // Check if it's a forum template request
            if (requestedPath === 'forumTemplate') {
                content = await fs.readFile(path.join(__dirname, '../../views/templates/forumTemplate.html'), 'utf8');
            } else {
                // Handle regular partials
                content = await fs.readFile(path.join(__dirname, '../../views/partials', `${requestedPath}.html`), 'utf8');
            }
            
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content);
        } catch (err) {
            console.error('Error loading partial/template:', err);
            res.writeHead(404);
            res.end('Partial or template not found');
        }
    },

    async handlePage(req, res) {
        try {
            let pageName = req.url === '/' ? 'index' : req.url.match(/^\/([^/]+)/)[1];
            let pageContent;

            if (pageName === 'index') {
                pageContent = await fs.readFile(path.join(__dirname, '../../views/pages/index.html'), 'utf8');
            } else {
                const template = templateService.getTemplateHTML();
                const content = await templateService.readPageContent(pageName);
                pageContent = template.replace('{{content}}', content);
            }

            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(pageContent);
        } catch (error) {
            const notFoundContent = await fs.readFile(path.join(__dirname, '../../views/pages/404.html'), 'utf8');
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(notFoundContent);
        }
    },

    async handleApi(req, res) {
        if (req.url === '/api/users') {
            try {
                const users = await User.findAll();
                res.writeHead(200, { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                });
                res.end(JSON.stringify(users));
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Database error' }));
            }
        }
        else if (req.url === '/api/forums') {
            try {
                console.log('Forum model available:', !!Forum); // Add this debug line
                console.log('Attempting to fetch forums');
                const forums = await Forum.findAll();
                console.log('Forums fetched:', forums);
                
                res.writeHead(200, { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                });
                res.end(JSON.stringify(forums));
            } catch (error) {
                console.error('Error in /api/forums:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    error: 'Database error',
                    details: error.message,
                    stack: error.stack // Add stack trace for debugging
                }));
            }
        }
        else if (req.url === '/api/forums/posts') {
            try {
                console.log('Forum model available:', !!Forum);
                console.log('Attempting to fetch forums');
                const forumposts = await Forum.findPostsById();
                console.log('Forum posts fetched:', forumposts);

                res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                });
                res.end(JSON.stringify(forums));
            } catch (error) {
                console.error('Error in /api/forums/posts', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    error: 'Database error',
                    details: error.message,
                    stack: error.stack // Add stack trace for debugging
                }));
            }
        }
        else if (req.url.match(/^\/api\/forums\/\d+$/)) {
            try {
                const forumId = req.url.split('/').pop();
                const forum = await Forum.findById(forumId);
                
                if (!forum) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Forum not found' }));
                    return;
                }
    
                res.writeHead(200, { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                });
                res.end(JSON.stringify(forum));
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Database error' }));
            }
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'API endpoint not found' }));
        }
    },
    async handleTemplate(req, res) {
        try {
            const templateName = req.url.split('/templates/')[1];
            console.log('Loading template:', templateName);
            
            const content = await fs.readFile(
                path.join(__dirname, '../../views/templates', `${templateName}.html`),
                'utf8'
            );
            
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content);
        } catch (err) {
            console.error('Error loading template:', err);
            res.writeHead(404);
            res.end('Template not found');
        }
    }
};

module.exports = getHandlers;