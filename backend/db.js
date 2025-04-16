const mysql = require('mysql2/promise');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',        // Default MySQL user for XAMPP is usually 'root'
  password: '',        // Default password for XAMPP MySQL is empty
  database: 'storemate',
  port:3306
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database.');
});

module.exports = connection;