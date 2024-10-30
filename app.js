// app.js
const http = require('http');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');

//Create  a connection pool with mySQL server redentials and dataabase name
const connection_pool = mysql.createPool({
  host     : '34.136.239.4',
  user     : 'group2',
  password : 'group2',
  database : 'testInstallation',
  connectionLimit : 10
});

// dictionary of all of the different types of files that we could send
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


// function to read partials
// partial in this case is refering to the header and footer, so for each page
// we don't need to load in the header and footer for each new page
// partialName is either header.html, or footer.html
function readPartial(partialName) {
    // promise is an async call, just saying hey this will come later
    return new Promise((resolve, reject) => {
        // gets the path of the partial and gets the data
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


// SERVER DATABASE REQUEST FUNCTION


// function to read page content
// it recieves the page (forums, account, messages) name the user is looking for
// and searches for it in the pages directory, if it finds it it returns it
function readPageContent(pageName) {
    return new Promise((resolve, reject) => {
        const pagePath = path.join(currentDir, 'pages', `${pageName}.html`);
        fs.readFile(pagePath, 'utf8', (err, content) => {
            if (err) {
                reject(err);
            } else {
                resolve(content);
            }
        });
    });
}

// function to get template HTML
function getTemplateHTML() {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SCSU Student Forum</title>
    <link rel="stylesheet" href="static/stylesheets/styles.css">
</head>
<body>
    <div id="header-container"></div>
    <div class="body">
        {{content}}
    </div>
    <div id="footer-container"></div>
    <script src="static/js/script.js"></script>
</body>
</html>`;
}

// anytime the client requests data it comes through this
const handleRequest = async function (req, res) {
    console.log(`Request received for: ${req.url}`);

    // this section handles partial requests
    // the AJAX request for header/footer
    if (req.url.startsWith('/partial/')) {
        // this gets the partial name from the url
        const partialName = req.url.split('/partial/')[1].replace('.html', '');
        // try to read the partial file and the send a success response with
        // the content
        try {
            const content = await readPartial(partialName);
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content);
        } catch (err) { // else send a 404 error, could not be found
            res.writeHead(404);
            res.end('Partial not found');
        }
        return; //end request
    }


     // Add this near the beginning of your existing handleRequest function
    if (req.url === '/api/books' && req.method === 'GET') {
        try {
            // Modified to use connection_pool and proper promise syntax
            const [rows] = await connection_pool.promise().query('SELECT * FROM books');
            
            // Send response
            res.writeHead(200, { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify(rows));
            return;
        } catch (error) {
            console.error('Database error:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Database error' }));
            return;
        }
    }

    // handles the static files such as stylesheets and javascript flies
    if (req.url.match(/\.(css|js|png|jpg|gif|ico)$/)) {
        // get the full path file
        const filePath = path.join(currentDir, req.url);
        const extname = String(path.extname(filePath)).toLowerCase();
        // this matches the content type to what is in the mime type dictionary 
        const contentType = mimeTypes[extname] || 'application/octet-stream';

        // try to read the file
        try {
            const content = await fs.promises.readFile(filePath);
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        } catch (error) { //if an error, send 404
            res.writeHead(404);
            res.end('File not found');
        }
        return; // end the request
    }

    // handle page requests, such as /forums, /messages, and /account
    let pageName = 'index';
    if (req.url !== '/') {
        // extracts the page name from the url, getting rid of any slashes on front or back
        // uses some regex which is a little gross but needed
        const match = req.url.match(/^\/([^/]+)/);
        // if we found something usable then we can use it
        if (match) {
            pageName = match[1];
        }
    }

    try {
        let pageContent;
        //if the page name is index (aka home) just read index.html
        if (pageName === 'index') {
            pageContent = await fs.promises.readFile(path.join(currentDir, 'index.html'), 'utf8');
        } else {
            // for other pages, get the template from above
            const template = getTemplateHTML();
            // get the page content, meaning the matching html in the pages directory
            const content = await readPageContent(pageName);
            // put it into the template
            pageContent = template.replace('{{content}}', content);
        }
        // send the page
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(pageContent);
    } catch (error) {
        // if the page isn't found, send a 404
        try {
            const notFoundContent = await fs.promises.readFile(path.join(currentDir, '404.html'));
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(notFoundContent);
        } catch (err) {
            res.writeHead(404);
            res.end('File Not Found');
        }
    }
};





// create an HTTP server
const httpServer = http.createServer(handleRequest);

// start the server
const port = 80;
httpServer.listen(port, () => {
    console.log(`HTTP Server running on port ${port}`);
    console.log(`Serving files from: ${currentDir}`);
});