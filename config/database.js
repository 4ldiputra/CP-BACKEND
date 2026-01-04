const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: process.env.MYSQL_PORT || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'ecommerce_db',
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
