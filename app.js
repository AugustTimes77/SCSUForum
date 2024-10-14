const http = require('http');
const fs = require('fs');
const path = require('path');

const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript'
};

const myserver = http.createServer(function (req, res) {
    console.log(`Request received for: ${req.url}`);

    // Normalize the file path
    let filePath = path.join(__dirname, 'website', req.url === '/' ? 'index.html' : req.url);
    
    // Ensure we're not allowing directory traversal
    if (!filePath.startsWith(path.join(__dirname, 'website'))) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                console.log(`File not found: ${filePath}`);
                res.writeHead(404);
                res.end('File Not Found');
            } else {
                console.log(`Server error: ${error.code}`);
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`);
            }
        } else {
            console.log(`Serving file: ${filePath}`);
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

myserver.listen(80);
console.log('Server running on port 80');