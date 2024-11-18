/**
 * models/User.js
 * Handles user-related database operations
 */

const db = require('../config/database');

class User {
    static async findAll() {
        try {
            console.log('Attempting to fetch all users');
            const [rows] = await db.pool.query('SELECT * FROM users');
            console.log('Successfully fetched users:', rows);
            return rows;
        } catch (error) {
            console.error('Database error in findAll:', error.message);
            // Re-throw the error with more details
            throw new Error(`Database error in findAll: ${error.message}`);
        }
    }

    static async create(userData) {
        const query = 'INSERT INTO users (username, password_hash, email, role) VALUES (?, ?, ?, ?)';
        const values = [
            userData.username,
            userData.password,
            userData.email,
            userData.role || 'owl'
        ];

        const [result] = await db.pool.query(query, values);
        return result;
    }
}

module.exports = User;