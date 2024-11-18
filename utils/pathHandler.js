/**
 * utils/pathHandler.js
 * Handles path resolution and validation
 */
const path = require('path');

const pathHandler = {
    resolvePath(basePath, ...paths) {
        const fullPath = path.join(basePath, ...paths);
        // Security check to prevent directory traversal
        if (!fullPath.startsWith(basePath)) {
            throw new Error('Invalid path');
        }
        return fullPath;
    },

    getExtension(filepath) {
        return path.extname(filepath).toLowerCase();
    }
};

module.exports = pathHandler;