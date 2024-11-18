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
}

module.exports = Forum;