// models/payment.js

const db = require('../config/database');

module.exports = {
  createPayment(data) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO payments 
        (order_id, payment_type, amount, payment_method, proof_image, status, payment_date)
        VALUES (?, ?, ?, ?, ?, 'pending', NOW())
      `;

      db.query(
        query,
        [
          data.order_id,
          data.payment_type,
          data.amount,
          data.payment_method,
          data.proof_image
        ],
        (err, results) => {
          if (err) return reject(err);
          resolve({ id: results.insertId, ...data });
        }
      );
    });
  },

  getPaymentByOrderId(order_id) {
    return new Promise((resolve, reject) => {
      // ✅ Ambil semua kolom, termasuk status_dp dan status_pelunasan
      db.query(
        "SELECT * FROM payments WHERE order_id = ?",
        [order_id],
        (err, results) => {
          if (err) return reject(err);
          resolve(results[0]);
        }
      );
    });
  },

  // ✅ Fungsi baru: Get All Payments for Admin
  getAllPayments() {
    return new Promise((resolve, reject) => {
      // ✅ Pastikan query mengambil status_dp dan status_pelunasan
      db.query(
        "SELECT * FROM payments ORDER BY payment_date DESC",
        (err, results) => {
          if (err) return reject(err);
          resolve(results);
        }
      );
    });
  }
};