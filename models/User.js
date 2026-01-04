const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Create new user
  static async create(userData) {
    const {
      name,
      username,
      email,
      password,
      phone,
      first_name,
      last_name,
      address,
      role_id = 1     // default user = 1
    } = userData;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO users (name, username, email, password, phone, first_name, last_name, address, role_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      db.execute(
        query, 
        [name, username, email, hashedPassword, phone, first_name, last_name, address, role_id],
        (err, results) => {
          if (err) {
            reject(err);
          } else {
            this.findById(results.insertId)
              .then(user => resolve(user))
              .catch(error => reject(error));
          }
        }
      );
    });
  }

  // Find user by email
  static findByEmail(email) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users WHERE email = ?';
      db.execute(query, [email], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results[0]);
        }
      });
    });
  }

  // Find user by username
  static findByUsername(username) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users WHERE username = ?';
      db.execute(query, [username], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results[0]);
        }
      });
    });
  }

  // Find user by ID (without password)
  static findById(id) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT id, name, username, email, phone, profile_image, 
               first_name, last_name, address, role_id, created_at, updated_at 
        FROM users WHERE id = ?
      `;
      db.execute(query, [id], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results[0]);
        }
      });
    });
  }

  // ========== TAMBAHKAN METHOD INI ==========
  
  // Find users by role_id
  static findByRoleId(role_id) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT id, name, username, email, phone, profile_image, 
               first_name, last_name, address, role_id, created_at, updated_at 
        FROM users WHERE role_id = ?
        ORDER BY created_at DESC
      `;
      db.execute(query, [role_id], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }

  // Find all users (for admin)
  static findAll() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT id, name, username, email, phone, profile_image, 
               first_name, last_name, address, role_id, created_at, updated_at 
        FROM users 
        ORDER BY role_id, created_at DESC
      `;
      db.execute(query, [], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }

  // Find user with password (for authentication)
  static findWithPassword(id) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users WHERE id = ?';
      db.execute(query, [id], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results[0]);
        }
      });
    });
  }

  // ========== END OF NEW METHODS ==========

  // Compare password
  static comparePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  // Update profile
  static updateProfile(id, updateData) {
    return new Promise((resolve, reject) => {
      const allowedFields = [
        'name', 'phone', 'first_name', 'last_name', 
        'address', 'profile_image', 'email'
      ];

      const fields = [];
      const values = [];

      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key) && updateData[key] !== undefined) {
          fields.push(`${key} = ?`);
          values.push(updateData[key]);
        }
      });

      if (fields.length === 0) {
        reject(new Error('No valid fields to update'));
        return;
      }

      values.push(id);

      const query = `
        UPDATE users 
        SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;
      
      db.execute(query, values, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }

  // Delete user by ID
  static deleteById(id) {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM users WHERE id = ?';
      db.execute(query, [id], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }

  // Update password
  static updatePassword(id, newPassword) {
    return new Promise(async (resolve, reject) => {
      try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const query = 'UPDATE users SET password = ? WHERE id = ?';
        db.execute(query, [hashedPassword, id], (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = User;