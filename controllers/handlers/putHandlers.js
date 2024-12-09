
const { pool } = require('../../config/database');

const User = require('../../models/User');
const Forum = require('../../models/Forum');


const parseBody = (req) => {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                resolve(JSON.parse(body));
            } catch (error) {
                reject(new Error('Invalid JSON'));
            }
        });
    });
};

const updateHandlers = {
    async handlePostReaction(req, res) {
        try {
            const data = await parseBody(req);
            const { post_id, isLike } = data;

            if (!post_id) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Post ID is required'}));
                return;
            }

            const updatedPost = await Forum.likePost(post_id, isLike);

            res.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify(updatedPost));
        } catch (error) {
            console.error('Error handling post reaction:', error);
            res.writehead(500, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({ error: 'Failed to update post reaction'}));
        }
    }
};




module.exports = updateHandlers;