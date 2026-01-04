const db = require("../config/database");
const fs = require("fs");
const path = require("path");

class ArticleController {

  // Upload Artikel (HANYA GAMBAR - TANPA TITLE)
  static async uploadArticle(req, res) {
    try {
      console.log("File:", req.file);
      console.log("Body:", req.body);

      const image_url = req.file ? req.file.filename : null;

      // Validasi - hanya gambar yang diperlukan
      if (!image_url) {
        return res.status(400).json({
          success: false,
          message: "Gambar diperlukan"
        });
      }

      // Simpan ke database tanpa title
      const sql = `
        INSERT INTO articles (image_url, status, created_at)
        VALUES (?, 'active', NOW())
      `;
      
      // Gunakan callback style
      db.execute(sql, [image_url], (error, results) => {
        if (error) {
          console.error("Database error:", error);
          
          // Hapus file jika error database
          if (req.file && req.file.path) {
            fs.unlinkSync(req.file.path);
          }
          
          return res.status(500).json({ 
            success: false, 
            message: "Gagal menyimpan ke database",
            error: error.message
          });
        }
        
        console.log("Insert result:", results);
        
        res.status(201).json({
          success: true,
          message: "Artikel berhasil diupload",
          data: {
            id: results.insertId,
            image_url: image_url,
            status: "active"
          }
        });
      });

    } catch (err) {
      console.error("Error upload artikel:", err);
      
      // Hapus file jika terjadi error
      if (req.file && req.file.path) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkErr) {
          console.error("Gagal menghapus file:", unlinkErr);
        }
      }
      
      res.status(500).json({ 
        success: false, 
        message: "Terjadi kesalahan server",
        error: err.message
      });
    }
  }

  // Semua Artikel (Admin)
  static async getAllArticles(req, res) {
    try {
      db.execute("SELECT * FROM articles ORDER BY id DESC", (error, results) => {
        if (error) {
          console.error("Database error:", error);
          return res.status(500).json({ 
            success: false, 
            message: "Gagal mengambil data artikel"
          });
        }
        
        res.json({ 
          success: true, 
          data: results,
          count: results.length
        });
      });
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ 
        success: false, 
        message: "Terjadi kesalahan"
      });
    }
  }

  // Artikel Aktif (User & Distributor)
  static async getActiveArticles(req, res) {
    try {
      db.execute(
        "SELECT * FROM articles WHERE status = 'active' ORDER BY id DESC", 
        (error, results) => {
          if (error) {
            console.error("Database error:", error);
            return res.status(500).json({ 
              success: false, 
              message: "Gagal mengambil data artikel aktif"
            });
          }
          
          res.json({ 
            success: true, 
            data: results,
            count: results.length
          });
        }
      );
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ 
        success: false, 
        message: "Terjadi kesalahan"
      });
    }
  }

  // Get Artikel by ID
  static async getArticleById(req, res) {
    try {
      const { id } = req.params;

      db.execute("SELECT * FROM articles WHERE id = ?", [id], (error, results) => {
        if (error) {
          console.error("Database error:", error);
          return res.status(500).json({ 
            success: false, 
            message: "Gagal mengambil data artikel"
          });
        }
        
        if (results.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Artikel tidak ditemukan"
          });
        }

        res.json({ 
          success: true, 
          data: results[0]
        });
      });
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ 
        success: false, 
        message: "Terjadi kesalahan"
      });
    }
  }

  // Update Status
  static async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Validasi input
      if (!["active", "nonactive"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Status harus 'active' atau 'nonactive'"
        });
      }

      db.execute(
        "UPDATE articles SET status = ? WHERE id = ?", 
        [status, id], 
        (error, results) => {
          if (error) {
            console.error("Database error:", error);
            return res.status(500).json({ 
              success: false, 
              message: "Gagal mengupdate status artikel"
            });
          }
          
          res.json({
            success: true,
            message: `Artikel berhasil di${status === 'active' ? 'aktifkan' : 'nonaktifkan'}`
          });
        }
      );
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ 
        success: false, 
        message: "Terjadi kesalahan"
      });
    }
  }

  // Delete Artikel
  static async deleteArticle(req, res) {
    try {
      const { id } = req.params;

      db.execute("DELETE FROM articles WHERE id = ?", [id], (error, results) => {
        if (error) {
          console.error("Database error:", error);
          return res.status(500).json({ 
            success: false, 
            message: "Gagal menghapus artikel"
          });
        }
        
        res.json({
          success: true,
          message: "Artikel berhasil dihapus"
        });
      });
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ 
        success: false, 
        message: "Terjadi kesalahan"
      });
    }
  }
}

module.exports = ArticleController;