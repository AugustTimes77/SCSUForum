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
            const [rows] = await db.pool.query(
                `SELECT p.post_id, p.forum_id, p.user_id, p.title, p.content, 
                 p.created_at, p.likes, p.dislikes, u.username 
                 FROM posts p 
                 LEFT JOIN users u ON p.user_id = u.user_id 
                 WHERE p.forum_id = ? 
                 ORDER BY p.created_at DESC`,
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

    static async likePost(postId, isLike) {
        try {
            const connection = await db.pool.getConnection();
            await connection.beginTransaction();
    
            try {
                // First check if post exists
                const [post] = await connection.query(
                    'SELECT likes, dislikes FROM posts WHERE post_id = ?',
                    [postId]
                );
    
                if (!post || post.length === 0) {
                    throw new Error('Post not found');
                }
    
                // Update the appropriate counter
                let query;
                if (isLike) {
                    query = 'UPDATE posts SET likes = likes + 1 WHERE post_id = ?';
                } else {
                    query = 'UPDATE posts SET dislikes = dislikes + 1 WHERE post_id = ?';
                }
    
                await connection.query(query, [postId]);
                await connection.commit();
    
                // Get updated post data
                const [updatedPost] = await connection.query(
                    'SELECT post_id, likes, dislikes FROM posts WHERE post_id = ?',
                    [postId]
                );
    
                connection.release();
                return updatedPost[0];
    
            } catch (error) {
                await connection.rollback();
                connection.release();
                throw error;
            }
        } catch (error) {
            console.error('Database error in likePost:', error.message);
            throw new Error(`Database error in likePost: ${error.message}`);
        }
    }

    static async create(forumData) {
        try {
            console.log('Attempting to create new forum:', forumData);
            
            const [result] = await db.pool.query(
                'INSERT INTO forums (name, description) VALUES (?, ?)',
                [forumData.name, forumData.description]
            );
            
            // Fetch and return the newly created forum
            const [newForum] = await db.pool.query(
                'SELECT forum_id, name, description FROM forums WHERE forum_id = ?',
                [result.insertId]
            );
    
            console.log('Successfully created forum:', newForum[0]);
            return newForum[0];
        } catch (error) {
            console.error('Database error in Forum.create:', error.message);
            throw new Error(`Database error in create: ${error.message}`);
        }
    }
}

module.exports = Forum;