const db = require('../config/database');

class Admin {
  // Create admin record
  static create(userId) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO admins (user_id)
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

  // Find admin by user_id
  static findByUserId(userId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT a.*, u.name, u.email, u.phone, u.address 
        FROM admins a
        JOIN users u ON a.user_id = u.id
        WHERE a.user_id = ?
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
      const query = 'DELETE FROM admins WHERE user_id = ?';
      db.execute(query, [userId], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }
 
}

module.exports = Admin;