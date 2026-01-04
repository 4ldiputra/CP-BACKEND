// controllers/paymentController.js
const Payment = require('../models/payment');

class PaymentController {

  // === FUNGSI USER ===
  static async createPayment(req, res) {
    try {
      const { order_id, payment_type, payment_method, amount } = req.body;

      if (!order_id || !payment_type || !payment_method) {
        return res.status(400).json({
          success: false,
          message: "Data pembayaran tidak lengkap: order_id, payment_type, payment_method wajib diisi."
        });
      }

      const orderIdNum = parseInt(order_id);
      if (isNaN(orderIdNum)) {
        return res.status(400).json({
          success: false,
          message: "order_id harus berupa angka."
        });
      }

      const validTypes = ['dp1', 'dp2'];
      if (!validTypes.includes(payment_type)) {
        return res.status(400).json({
          success: false,
          message: "payment_type tidak valid. Gunakan 'dp1' untuk DP pertama atau 'dp2' untuk pelunasan."
        });
      }

      const finalAmount = amount ? parseFloat(amount) : 0;

      const data = {
        order_id: orderIdNum,
        payment_type,
        amount: finalAmount,
        payment_method,
        proof_image: req.file ? req.file.path : null
      };

      const result = await Payment.createPayment(data);

      res.status(201).json({
        success: true,
        message: "Pembayaran berhasil diajukan",
        data: result
      });

    } catch (error) {
      console.error("Payment create error:", error);
      res.status(500).json({
        success: false,
        message: "Gagal membuat pembayaran",
        error: error.message
      });
    }
  }

  static async getInvoice(req, res) {
    try {
      const { order_id } = req.params;
      const payment = await Payment.getPaymentByOrderId(order_id);

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: "Data pembayaran tidak ditemukan untuk order ini."
        });
      }

      res.json({
        success: true,
        message: "Data pembayaran ditemukan",
        data: payment
      });

    } catch (error) {
      console.error("Get invoice error:", error);
      res.status(500).json({
        success: false,
        message: "Gagal mengambil data pembayaran",
        error: error.message
      });
    }
  }

  // === FUNGSI ADMIN ===
  static async getAllPayments(req, res) {
    try {
      const payments = await Payment.getAllPayments();
      res.json({
        success: true,
        data: payments
      });
    } catch (error) {
      console.error("Get all payments error:", error);
      res.status(500).json({
        success: false,
        message: "Gagal mengambil data pembayaran"
      });
    }
  }

  static async updateDP(req, res) {
    try {
      const { id } = req.params;
      const { status_dp } = req.body;

      if (!status_dp || !['diterima', 'ditolak'].includes(status_dp)) {
        return res.status(400).json({
          success: false,
          message: "Status DP tidak valid. Harus 'diterima' atau 'ditolak'."
        });
      }

      const paymentId = parseInt(id);
      if (isNaN(paymentId)) {
        return res.status(400).json({
          success: false,
          message: "ID pembayaran tidak valid."
        });
      }

      const result = await Payment.updateDP(paymentId, status_dp);

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Pembayaran tidak ditemukan."
        });
      }

      res.json({
        success: true,
        message: "Status DP berhasil diperbarui."
      });

    } catch (error) {
      console.error("Update DP error:", error);
      res.status(500).json({
        success: false,
        message: "Gagal memperbarui status DP."
      });
    }
  }

  static async updatePelunasan(req, res) {
    try {
      const { id } = req.params;
      const { status_pelunasan } = req.body;

      if (!status_pelunasan || !['diterima', 'ditolak'].includes(status_pelunasan)) {
        return res.status(400).json({
          success: false,
          message: "Status pelunasan tidak valid. Harus 'diterima' atau 'ditolak'."
        });
      }

      const paymentId = parseInt(id);
      if (isNaN(paymentId)) {
        return res.status(400).json({
          success: false,
          message: "ID pembayaran tidak valid."
        });
      }

      const result = await Payment.updatePelunasan(paymentId, status_pelunasan);

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Pembayaran tidak ditemukan."
        });
      }

      res.json({
        success: true,
        message: "Status pelunasan berhasil diperbarui."
      });

    } catch (error) {
      console.error("Update pelunasan error:", error);
      res.status(500).json({
        success: false,
        message: "Gagal memperbarui status pelunasan."
      });
    }
  }
}

module.exports = PaymentController;