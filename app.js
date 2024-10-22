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

// Get the directory where the script is located
const currentDir = __dirname;

const handleRequest = function (req, res) {
    console.log(`Request received for: ${req.url}`);

    let filePath = path.join(currentDir, req.url === '/' ? 'index.html' : req.url);
    
    // Ensure we're not allowing directory traversal
    if (!filePath.startsWith(currentDir)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                console.log(`File not found: ${req.url}`);
		res.writeHead(404);
                res.end('File Not Found');
            } else {
                console.log(`Server error: ${error.code}`);
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
};

// Create an HTTP server
const httpServer = http.createServer(handleRequest);

// Start the server
const port = 80; // You can change this to a higher number if you don't have root privileges
httpServer.listen(port, () => {
    console.log(`HTTP Server running on port ${port}`);
    console.log(`Serving files from: __dirname`);
});
