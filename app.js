// app.js
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
};

const currentDir = __dirname;

// Function to read partial content
function readPartial(partialName) {
    return new Promise((resolve, reject) => {
        const partialPath = path.join(currentDir, 'includes', 'partials', `${partialName}.html`);
        fs.readFile(partialPath, 'utf8', (err, content) => {
            if (err) {
                reject(err);
            } else {
                resolve(content);
            }
        });
    });
}

const handleRequest = function (req, res) {
    console.log(`Request received for: ${req.url}`);

    // Handle partial requests
    if (req.url.startsWith('/partial/')) {
        const partialName = req.url.split('/partial/')[1].replace('.html', '');
        readPartial(partialName)
            .then(content => {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(content);
            })
            .catch(err => {
                res.writeHead(404);
                res.end('Partial not found');
            });
        return;
    }

    // Rest of your existing handleRequest code...
    let urlPath = req.url === '/' ? '/index.html' : req.url;
    let isContentRequest = false;

    if (urlPath.match(/^\/(forums|messages|account)$/)) {
        urlPath = `/pages${urlPath}.html`;
        isContentRequest = true;
    }

    let filePath = path.join(currentDir, urlPath);
    
    if (!filePath.startsWith(currentDir)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        // Your existing error handling and response code...
        if (error) {
            if (error.code === 'ENOENT') {
                fs.readFile(path.join(currentDir, '404.html'), (err, notFoundContent) => {
                    if (err) {
                        res.writeHead(404);
                        res.end('File Not Found');
                    } else {
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        res.end(notFoundContent);
                    }
                });
            } else {
                console.log(`Server error: ${error.code}`);
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            if (isContentRequest) {
                res.end(content);
            } else {
                res.end(content);
            }
        }
    });
};

// Create an HTTP server
const httpServer = http.createServer(handleRequest);

// Start the server
const port = 80;
httpServer.listen(port, () => {
    console.log(`HTTP Server running on port ${port}`);
    console.log(`Serving files from: ${currentDir}`);
});