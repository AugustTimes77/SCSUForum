/**
 * utils/responseHelper.js
 * Standardizes HTTP responses
 */
const responseHelper = {
    sendJson(res, data, status = 200) {
        res.writeHead(status, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify(data));
    },

    sendError(res, error, status = 500) {
        res.writeHead(status, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            error: error.message || 'Internal Server Error',
            status
        }));
    },

    sendFile(res, content, contentType) {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
    }
};

module.exports = responseHelper;