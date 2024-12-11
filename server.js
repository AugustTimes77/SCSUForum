const express = require('express');
const mysql = require('mysql2');
const app = express();
app.use(express.json());


const connection_pool = mysql.createPool({
  host: '34.136.239.4',
  user: 'group2',
  password: 'group2',
  database: 'testInstallation',
  connectionLimit: 10
});



// inserts new users in the db
app.post('/signup', (req, res) => {
    const { username, email, password } = req.body;

    // sql query - inserts new users with user,email,pass
    const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    connection_pool.query(query, [username, email, password], (err, result) => {
        if (err) {
            res.status(500).send('ERROR - sign up did not go through');
        } else {
            res.status(200).send('Welcome, you Signed Up');
        }
    });
});

// when signing in - verify info
app.post('/signin', (req, res) => {
    const { email, password } = req.body;

    // sql code checks if user exists w email + password
    const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
    connection_pool.query(query, [email, password], (err, results) => {
        if (err || results.length == 0) {
            res.status(401).send('Invalid Inputs');
        } else {
            res.status(200).send('Welcome Back!');
        }
    });
});

app.listen(8000, () => {
    console.log();
});
