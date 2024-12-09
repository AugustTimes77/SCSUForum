// models/Forum.js

const db = require('../config/database');

class Forum {
    static async findAll() {
        try {
            console.log('Attempting to fetch all forums');
            const [rows] = await db.pool.query('SELECT forum_id, name, description FROM forums');
            console.log('Successfully fetched forums:', rows);
            return rows;
        } catch (error) {
            console.error('Database error in Forum.findAll:', error.message);
            throw new Error(`Database error in findAll: ${error.message}`);
        }
    }

    static async findById(id) {
        try {
            console.log('Attempting to fetch forum with id:', id);
            const [rows] = await db.pool.query(
                'SELECT forum_id, name, description FROM forums WHERE forum_id = ?', 
                [id]
            );
            console.log('Forum query result:', rows[0]);
            return rows[0];
        } catch (error) {
            console.error('Database error in Forum.findById:', error.message);
            throw new Error(`Database error in findById: ${error.message}`);
        }
    }

    static async findPostsById(id) {
        try {
            console.log('Attempting to fetch posts with forum id:', id);
            const [rows] = await db.pool.query('SELECT post_id, forum_id, title, content, created_at, likes, dislikes FROM posts WHERE forum_id = ? ORDER BY created_at DESC',
                [id]
            );
            return rows;
        } catch (error) {
            throw new Error(`Database error in findPostsById: ${error.message}`)
        }
    }

    static async findByName(name) {
        try {
            console.log('Attempting to fetch forum with name:', name);
            const [rows] = await db.pool.query(
                'SELECT forum_id, name, description FROM forums WHERE LOWER(name) = LOWER(?)', 
                [name.replace(/_/g, ' ')] // Replace underscores with spaces
            );
            console.log('Forum query result:', rows[0]);
            return rows[0];
        } catch (error) {
            console.error('Database error in Forum.findByName:', error.message);
            throw new Error(`Database error in findByName: ${error.message}`);
        }
    }

    static async createPost(postData) {
        try {
            // Remove post_id from the query since it's auto-incrementing
            const query = 'INSERT INTO posts (user_id, forum_id, title, content, created_at) VALUES (?, ?, ?, ?, NOW())';
            const values = [
                postData.user_id,
                postData.forum_id,
                postData.title,
                postData.content
            ];

            const [result] = await db.pool.query(query, values);
            return {
                success: true,
                post_id: result.insertId,
                ...postData,
                created_at: new Date()
            };
        } catch (error) {
            console.error('Database error in createPost:', error);
            throw new Error(`Database error in createPost: ${error.message}`);
        }
    }

    static async likePost(postId, isLike){
        try {
            const connection = await db.pool.getConnection();
            await connection.beginTransaction();

            try {
                const [post] = await connection.query(
                    'SELECT likes, dislikes FROM posts WHERE post_id = ?',
                    [postId]
                );
                if (!post || post.length === 0){
                    throw new Error('Post not found');
                }

                let query;
                if (isLike) {
                    query = 'UPDATE posts SET likes = likes + 1 WHERE post_id = ?';
                } else {
                    query = 'UPDATE posts SET dislikes = dislikes + 1 WHERE post_id = ?';
                }

                await connection.query(query, [postId]);

                await connection.commit();

                const [updatedPost] = await connection.query(
                    'SELECT post_id, likes, dislikes FROM posts WHERE post_id = ?',
                    [postId]
                );

                connection.release();
                return updatedPost[0];

            } catch(error){
                await connection.rollback();
                connection.release();
                throw error;
            }
        } catch (error) {
            console.error('Database error in likePost:', error.message);
            throw new Error(`Database error in likePost: ${error.message}`);
        }
    }
}

module.exports = Forum;