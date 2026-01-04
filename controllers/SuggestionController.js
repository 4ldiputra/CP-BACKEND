const db = require("../config/database");

class SuggestionController {

  // Siapa saja bisa kirim saran (tanpa login, tanpa user_type)
  static async createSuggestion(req, res) {
    try {
      const { suggestion_text } = req.body;

      console.log("Suggestion received:", suggestion_text);

      // Validasi
      if (!suggestion_text || suggestion_text.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Saran tidak boleh kosong"
        });
      }

      // Batasi panjang saran (optional)
      if (suggestion_text.length > 1000) {
        return res.status(400).json({
          success: false,
          message: "Saran terlalu panjang (maksimal 1000 karakter)"
        });
      }

      // Simpan saran ke database (ANONIM, tanpa user_type)
      const sql = `
        INSERT INTO suggestions (suggestion_text)
        VALUES (?)
      `;

      db.execute(sql, [suggestion_text.trim()], (error, results) => {
        if (error) {
          console.error("Database error:", error);
          return res.status(500).json({ 
            success: false, 
            message: "Gagal mengirim saran"
          });
        }

        res.status(201).json({
          success: true,
          message: "Saran berhasil dikirim",
          data: {
            id: results.insertId
          }
        });
      });

    } catch (err) {
      console.error("Error create suggestion:", err);
      res.status(500).json({ 
        success: false, 
        message: "Terjadi kesalahan server"
      });
    }
  }

  // Admin: Get semua saran (hanya text saja)
  static async getAllSuggestions(req, res) {
    try {
      // Cek apakah admin (sesuaikan dengan auth system Anda)
      // const { role } = req.session.user || req.user || {};
      // if (role !== 'admin') {
      //   return res.status(403).json({
      //     success: false,
      //     message: "Akses ditolak. Hanya admin yang dapat melihat saran"
      //   });
      // }

      // Query hanya mengambil text saran dan tanggal
      const sql = `
        SELECT 
          id,
          suggestion_text,
          DATE_FORMAT(created_at, '%d-%m-%Y %H:%i') as created_at
        FROM suggestions
        ORDER BY created_at DESC
      `;

      db.execute(sql, (error, results) => {
        if (error) {
          console.error("Database error:", error);
          return res.status(500).json({ 
            success: false, 
            message: "Gagal mengambil data saran"
          });
        }

        res.json({
          success: true,
          data: results,
          count: results.length
        });
      });

    } catch (err) {
      console.error("Error get all suggestions:", err);
      res.status(500).json({ 
        success: false, 
        message: "Terjadi kesalahan server"
      });
    }
  }
}

module.exports = SuggestionController;