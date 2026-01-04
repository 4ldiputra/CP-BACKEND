// baru menambahkan alamat
const db = require('../config/database');

const Address = {
  // Ambil semua alamat user
  findByUserId: (userId) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT ua.*, c.name as city_name, p.name as province_name
        FROM user_addresses ua
        JOIN cities c ON ua.city_id = c.id
        JOIN provinces p ON ua.province_id = p.id
        WHERE ua.user_id = ?
        ORDER BY ua.is_default DESC, ua.created_at DESC
      `;
      db.query(query, [userId], (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  },

  // Ambil alamat default
  findDefaultByUserId: (userId) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT ua.*, c.name as city_name, p.name as province_name
        FROM user_addresses ua
        JOIN cities c ON ua.city_id = c.id
        JOIN provinces p ON ua.province_id = p.id
        WHERE ua.user_id = ? AND ua.is_default = 1
      `;
      db.query(query, [userId], (err, results) => {
        if (err) reject(err);
        resolve(results[0]);
      });
    });
  },

  // Tambah alamat baru
  create: (addressData) => {
    return new Promise((resolve, reject) => {
      db.query('INSERT INTO user_addresses SET ?', addressData, (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });
  },

  // Update alamat
  update: (id, userId, addressData) => {
    return new Promise((resolve, reject) => {
      db.query(
        'UPDATE user_addresses SET ? WHERE id = ? AND user_id = ?',
        [addressData, id, userId],
        (err, result) => {
          if (err) reject(err);
          resolve(result);
        }
      );
    });
  },

  // Hapus alamat
  delete: (id, userId) => {
    return new Promise((resolve, reject) => {
      db.query(
        'DELETE FROM user_addresses WHERE id = ? AND user_id = ?',
        [id, userId],
        (err, result) => {
          if (err) reject(err);
          resolve(result);
        }
      );
    });
  },

  // Set alamat default
  setDefault: (id, userId) => {
    return new Promise((resolve, reject) => {
      db.beginTransaction((err) => {
        if (err) return reject(err);

        // Reset semua alamat jadi tidak default
        db.query(
          'UPDATE user_addresses SET is_default = 0 WHERE user_id = ?',
          [userId],
          (err) => {
            if (err) {
              return db.rollback(() => reject(err));
            }

            // Set alamat yang dipilih jadi default
            db.query(
              'UPDATE user_addresses SET is_default = 1 WHERE id = ? AND user_id = ?',
              [id, userId],
              (err, result) => {
                if (err) {
                  return db.rollback(() => reject(err));
                }

                db.commit((err) => {
                  if (err) {
                    return db.rollback(() => reject(err));
                  }
                  resolve(result);
                });
              }
            );
          }
        );
      });
    });
  },

  // Ambil alamat by ID
  findById: (id, userId) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT ua.*, c.name as city_name, p.name as province_name
        FROM user_addresses ua
        JOIN cities c ON ua.city_id = c.id
        JOIN provinces p ON ua.province_id = p.id
        WHERE ua.id = ? AND ua.user_id = ?
      `;
      db.query(query, [id, userId], (err, results) => {
        if (err) reject(err);
        resolve(results[0]);
      });
    });
  }
};

module.exports = Address;