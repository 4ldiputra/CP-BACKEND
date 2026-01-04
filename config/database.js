const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
    host: '127.0.0.1',          // PENTING: jangan pakai "localhost"
    port: 8889,                 // default MySQL port
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ecommerce_db',
    charset: 'utf8mb4'
});

connection.connect((err) => {
    if (err) {
        console.error("DB ERROR:", err);
        return;
    }
    console.log("Connected to database!");
});

module.exports = connection;
