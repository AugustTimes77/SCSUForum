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
            // Handle favicon.ico request
            if (req.url === '/favicon.ico') {
                res.writeHead(204); // No content
                res.end();
                return;
            }

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
        try {
            if (req.url === '/api/users') {
                const users = await User.findAll();
                res.writeHead(200, { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                });
                res.end(JSON.stringify(users));
            }
            else if (req.url === '/api/forums') {
                const forums = await Forum.findAll();
                res.writeHead(200, { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                });
                res.end(JSON.stringify(forums));
            }
            else if (req.url.match(/^\/api\/forums\/posts\/\d+$/)) {
                const forumId = req.url.split('/').pop();
                const posts = await Forum.findPostsById(forumId);
                res.writeHead(200, { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                });
                res.end(JSON.stringify(posts));
            }
            else if (req.url.match(/^\/api\/forums\/\d+$/)) {
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
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'API endpoint not found' }));
            }
        } catch (error) {
            if (!res.headersSent) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Server error' }));
            }
        }
    },
 
    async handleForum(req, res) {
        try {
            const forumIdentifier = req.url.split('/forum/')[1];
            let forum;

            if (/^\d+$/.test(forumIdentifier)) {
                forum = await Forum.findById(forumIdentifier);
            } else {
                forum= await Forum.findByName(decodeURIComponent(forumIdentifier));
            }

            if (!forum) {
                
                const notFoundContent = await fs.readFile(
                    path.join(__dirname, '../../views/pages/404.html'), 
                    'utf8'
                );
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end(notFoundContent);
                return;
            }

            const posts = await Forum.findPostsById(forum.forum_id);
            
            const template = await templateService.readTemplateContent('forumTemplate');
            const processedTemplate = template
                .replace('FORUM NAME', forum.name)
                .replace('FORUM DESCRIPTION', forum.description);

            const mainTemplate = templateService.getTemplateHTML();

            const fullPage = mainTemplate.replace(`,{{content}}`, processedForumContent);

            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(processedTemplate);

        } catch (error) {
            console.error('Error handling forum request:', error);
            res.writeHead(500, { 'Content-Type': 'text/html' });
            res.end('Internal Server Error');
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