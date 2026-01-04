const db = require('../config/database');

class Distributor {

  // Insert minimal saat register
  static async create(userId) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO distributors (user_id)
        VALUES (?)
      `;

      db.execute(query, [userId], (err, result) => {
        if (err) return reject(err);
        resolve({ id: result.insertId, user_id: userId });
      });
    });
  }

  // Ambil profile distributor berdasarkan user_id
  static async findByUserId(userId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT d.*, u.name, u.email, u.phone AS user_phone
        FROM distributors d
        JOIN users u ON u.id = d.user_id
        WHERE d.user_id = ?
      `;
      db.execute(query, [userId], (err, result) => {
        if (err) return reject(err);
        resolve(result[0]);
      });
    });
  }

  // Update profile distributor
  static async update(userId, updateData) {
    return new Promise((resolve, reject) => {
      const allowed = [
        'distributor_name',
        'description',
        'address',
        'phone',
        'profile_image'
      ];

      const fields = [];
      const values = [];

      Object.keys(updateData).forEach(key => {
        if (allowed.includes(key) && updateData[key] !== undefined) {
          fields.push(`${key} = ?`);
          values.push(updateData[key]);
        }
      });

      if (fields.length === 0) {
        return reject(new Error('No valid fields to update'));
      }

      values.push(userId);

      const query = `
        UPDATE distributors
        SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `;

      db.execute(query, values, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }

  // ========== TAMBAHKAN METHOD INI ==========
  static deleteByUserId(userId) {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM distributors WHERE user_id = ?';
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

module.exports = Distributor;