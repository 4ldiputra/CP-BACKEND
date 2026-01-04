const db = require('../config/database');

class Customer {
  // Create customer record
  static create(userId) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO customers (user_id)
        VALUES (?)
      `;

      db.execute(query, [userId], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve({ id: results.insertId, user_id: userId });
        }
      });
    });
  }

  // Find customer by user_id
  static findByUserId(userId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT c.*, u.name, u.email, u.phone, u.address 
        FROM customers c
        JOIN users u ON c.user_id = u.id
        WHERE c.user_id = ?
      `;

      db.execute(query, [userId], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results[0]);
        }
      });
    });
  }

  // ========== TAMBAHKAN METHOD INI ==========
  static deleteByUserId(userId) {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM customers WHERE user_id = ?';
      db.execute(query, [userId], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }
  // ========== END ==========
}

module.exports = Customer;