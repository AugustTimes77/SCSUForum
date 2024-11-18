/**
 * services/templateService.js
 * Handles HTML template loading and processing
 */

const fs = require('fs').promises;
const path = require('path');

class TemplateService {
    constructor() {
        this.viewsDir = path.join(__dirname, '../views');
        this.partialsDir = path.join(this.viewsDir, 'partials');
        this.pagesDir = path.join(this.viewsDir, 'pages');
        this.templatesDir = path.join(this.viewsDir, 'templates');  // Add this line
    }


    async readPartial(partialName) {
        return await fs.readFile(path.join(this.partialsDir, `${partialName}.html`), 'utf8');
    }

    async readPageContent(pageName) {
        return await fs.readFile(path.join(this.pagesDir, `${pageName}.html`), 'utf8');
    }

    async readTemplateContent(templateName) {
        return await fs.readFile(path.join(this.templatesDir, `${templateName}.html`), 'utf8');
    }

    getTemplateHTML() {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SCSU Student Forum</title>
    <link rel="stylesheet" href="/css/styles.css">
</head>
<body>
    <div id="header-container"></div>
    <div class="body">
        {{content}}
    </div>
    <div id="footer-container"></div>
    <script src="/js/main.js"></script>
    <script src="/js/api.js"></script>
</body>
</html>`;
    }
}

module.exports = new TemplateService();