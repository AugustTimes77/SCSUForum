const { pool } = require('../../config/database');

const deleteHandlers = {
    async handleDeletePost(req, res) {
        try {
            const postId = req.url.split('/').pop();
            
            // Get user info from session to check admin role
            const user = req.session?.user;
            if (!user || user.role !== 'admin') {
                res.writeHead(403, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Forbidden - Admin access required' }));
                return;
            }

            // Delete the post
            await pool.query('DELETE FROM posts WHERE post_id = ?', [postId]);
            
            res.writeHead(200, { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify({ success: true }));
        } catch (error) {
            console.error('Error deleting post:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to delete post' }));
        }
    }
};

module.exports = deleteHandlers;