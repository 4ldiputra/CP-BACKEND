const db = require("../config/database");

class ProductController {
  // =====================================================================
  // PRODUK SECTION (USER + MITRA)
  // =====================================================================

  // ====================== UPLOAD PRODUK MITRA ======================
  static async uploadProductMitra(req, res) {
    try {
      const {
        product_name,
        description,
        specifications,
        regular_price,
        discount_price,
        stock,
        category_id,
        subcategory_id,
      } = req.body;

      const images = req.files ? req.files.map((file) => file.filename) : [];

      const sql = `
        INSERT INTO products (
          product_name, description, specifications,
          regular_price, discount_price, stock,
          category_id, subcategory_id, images, owner_role_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await db.execute(sql, [
        product_name,
        description,
        specifications,
        regular_price,
        discount_price,
        stock,
        category_id,
        subcategory_id,
        JSON.stringify(images),
        2,
      ]);

      res.json({ success: true, message: "Produk mitra berhasil ditambahkan" });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ success: false, message: "Gagal menambahkan produk mitra" });
    }
  }

  // ====================== UPLOAD PRODUK USER ======================
  static async uploadProductUser(req, res) {
    try {
      const {
        product_name,
        description,
        specifications,
        regular_price,
        stock,
        category_id,
        subcategory_id,
      } = req.body;

      const discount_price = req.body.discount_price || 0;

      const images = req.files ? req.files.map((file) => file.filename) : [];

      const sql = `
      INSERT INTO products (
        product_name, description, specifications,
        regular_price, discount_price, stock,
        category_id, subcategory_id, images, owner_role_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

      await db.execute(sql, [
        product_name,
        description,
        specifications,
        regular_price,
        discount_price, // <---- FIX DI SINI
        stock,
        category_id,
        subcategory_id,
        JSON.stringify(images),
        1,
      ]);

      res.json({ success: true, message: "Produk user berhasil ditambahkan" });
    } catch (err) {
      console.error("Upload User Error:", err);
      res
        .status(500)
        .json({ success: false, message: "Gagal menambahkan produk user" });
    }
  }

  static async getProductDetailMitra(req, res) {
    try {
      const { id } = req.params;

      const result = await new Promise((resolve, reject) => {
        db.execute(
          "SELECT * FROM products WHERE id = ? AND owner_role_id = 2 AND is_available = 1",
          [id],
          (error, rows) => (error ? reject(error) : resolve(rows))
        );
      });

      if (result.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Produk Mitra tidak ditemukan",
        });
      }

      res.json({ success: true, data: result[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: "Gagal mengambil detail produk mitra",
      });
    }
  }

  static async getProductDetailUser(req, res) {
    try {
      const { id } = req.params;

      const result = await new Promise((resolve, reject) => {
        db.execute(
          "SELECT * FROM products WHERE id = ? AND owner_role_id = 1 AND is_available = 1",
          [id],
          (error, rows) => (error ? reject(error) : resolve(rows))
        );
      });

      if (result.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Produk User tidak ditemukan",
        });
      }

      res.json({ success: true, data: result[0] });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Gagal mengambil detail produk user",
      });
    }
  }

  // ====================== GET PRODUK MITRA ======================
  static async getProductsMitra(req, res) {
    try {
      const result = await new Promise((resolve, reject) => {
        db.execute(
          "SELECT * FROM products WHERE owner_role_id = 2 AND is_available = 1",
          (error, results) => (error ? reject(error) : resolve(results))
        );
      });

      res.json({ success: true, data: result });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Gagal mengambil produk mitra" });
    }
  }

  // ====================== GET PRODUK USER ======================
  static async getProductsUser(req, res) {
    try {
      const result = await new Promise((resolve, reject) => {
        db.execute(
          "SELECT * FROM products WHERE owner_role_id = 1 AND is_available = 1",
          (error, results) => (error ? reject(error) : resolve(results))
        );
      });

      res.json({ success: true, data: result });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Gagal mengambil produk user" });
    }
  }

  // ====================== GET DETAIL PRODUK ======================
  static async getProductById(req, res) {
    try {
      const { id } = req.params;

      const result = await new Promise((resolve, reject) => {
        db.execute(
          "SELECT * FROM products WHERE id = ? AND is_available = 1",
          [id],
          (error, results) => (error ? reject(error) : resolve(results))
        );
      });

      if (result.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Produk tidak ditemukan" });
      }

      res.json({ success: true, data: result[0] });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Gagal mengambil detail produk" });
    }
  }

  // ====================== EDIT PRODUK MITRA ======================
  static async editProductMitra(req, res) {
    try {
      const { id } = req.params;

      const {
        product_name,
        description,
        specifications,
        regular_price,
        discount_price,
        stock,
        category_id,
        subcategory_id,
      } = req.body;

      const checkResult = await new Promise((resolve, reject) => {
        db.execute(
          "SELECT images FROM products WHERE id = ? AND owner_role_id = 2 AND is_available = 1",
          [id],
          (error, results) => (error ? reject(error) : resolve(results))
        );
      });

      if (checkResult.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Produk mitra tidak ditemukan" });
      }

      const oldImages = JSON.parse(checkResult[0].images || "[]");
      const finalImages =
        req.files?.length > 0 ? req.files.map((f) => f.filename) : oldImages;

      await new Promise((resolve, reject) => {
        db.execute(
          `UPDATE products SET
            product_name=?, description=?, specifications=?,
            regular_price=?, discount_price=?, stock=?,
            category_id=?, subcategory_id=?, images=?
          WHERE id=? AND owner_role_id=2 AND is_available=1`,
          [
            product_name,
            description,
            specifications,
            regular_price,
            discount_price,
            stock,
            category_id,
            subcategory_id,
            JSON.stringify(finalImages),
            id,
          ],
          (error, results) => (error ? reject(error) : resolve(results))
        );
      });

      res.json({ success: true, message: "Produk mitra berhasil diupdate" });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Gagal update produk mitra" });
    }
  }

  // ====================== EDIT PRODUK USER ======================
  static async editProductUser(req, res) {
    try {
      const { id } = req.params;

      const {
        product_name,
        description,
        specifications,
        regular_price,
        discount_price,
        stock,
        category_id,
        subcategory_id,
      } = req.body;

      const checkResult = await new Promise((resolve, reject) => {
        db.execute(
          "SELECT images FROM products WHERE id = ? AND owner_role_id = 1 AND is_available = 1",
          [id],
          (error, results) => (error ? reject(error) : resolve(results))
        );
      });

      if (checkResult.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Produk user tidak ditemukan" });
      }

      const oldImages = JSON.parse(checkResult[0].images || "[]");
      const finalImages =
        req.files?.length > 0 ? req.files.map((f) => f.filename) : oldImages;

      await new Promise((resolve, reject) => {
        db.execute(
          `UPDATE products SET
            product_name=?, description=?, specifications=?,
            regular_price=?, discount_price=?, stock=?,
            category_id=?, subcategory_id=?, images=?
          WHERE id=? AND owner_role_id=1 AND is_available=1`,
          [
            product_name,
            description,
            specifications,
            regular_price,
            discount_price,
            stock,
            category_id,
            subcategory_id,
            JSON.stringify(finalImages),
            id,
          ],
          (error, results) => (error ? reject(error) : resolve(results))
        );
      });

      res.json({ success: true, message: "Produk user berhasil diupdate" });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Gagal update produk user" });
    }
  }

  // ====================== DELETE PRODUK MITRA ======================
  static async deleteProductMitra(req, res) {
    try {
      const { id } = req.params;

      await db.execute(
        "UPDATE products SET is_available = 0 WHERE id = ? AND owner_role_id = 2",
        [id]
      );

      res.json({ success: true, message: "Produk mitra berhasil dihapus" });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Gagal menghapus produk mitra" });
    }
  }

  // ====================== DELETE PRODUK USER ======================
  static async deleteProductUser(req, res) {
    try {
      const { id } = req.params;

      await db.execute(
        "UPDATE products SET is_available = 0 WHERE id = ? AND owner_role_id = 1",
        [id]
      );

      res.json({ success: true, message: "Produk user berhasil dihapus" });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Gagal menghapus produk user" });
    }
  }

  // ====================== GET ALL ORDERS (FOR ADMIN) ======================
  static async getAllOrders(req, res) {
    try {
      const roleId = req.session.role_id;
      if (roleId !== 3) {
        return res.status(403).json({
          success: false,
          message: "Akses ditolak. Hanya admin",
        });
      }

      // ================= ORDER =================
      const orders = await new Promise((resolve, reject) => {
        db.query(
          `SELECT 
          o.id,
          o.user_id,
          o.total_price,
          o.status AS order_status,
          o.created_at,
          u.name AS customer_name,
          u.phone AS customer_phone
        FROM orders o
        JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC`,
          (err, rows) => (err ? reject(err) : resolve(rows))
        );
      });

      for (let order of orders) {
        // ================= ITEMS =================
        const items = await new Promise((resolve, reject) => {
          db.query(
            `SELECT 
            oi.id,
            oi.product_id,
            oi.quantity,
            p.product_name
          FROM order_items oi
          JOIN products p ON p.id = oi.product_id
          WHERE oi.order_id = ?`,
            [order.id],
            (err, rows) => (err ? reject(err) : resolve(rows))
          );
        });

        // ================= PAYMENTS =================
        const payments = await new Promise((resolve, reject) => {
          db.query(
            `SELECT
            id,
            payment_type,
            amount,
            payment_method,
            proof_image,
            status,
            status_dp,
            status_pelunasan,
            created_at
          FROM payments
          WHERE order_id = ?
          ORDER BY created_at ASC`,
            [order.id],
            (err, rows) => (err ? reject(err) : resolve(rows))
          );
        });

        // ================= HITUNG PEMBAYARAN =================
        const totalPaid = payments.reduce(
          (sum, p) => sum + Number(p.amount || 0),
          0
        );

        const isLunas = totalPaid >= Number(order.total_price);

        // ================= AUTO UPDATE STATUS =================
        if (isLunas && order.order_status !== "lunas") {
          await new Promise((resolve, reject) => {
            db.query(
              "UPDATE orders SET status = 'lunas' WHERE id = ?",
              [order.id],
              (err) => (err ? reject(err) : resolve())
            );
          });
          order.order_status = "lunas";
        }

        // ================= ATTACH =================
        order.items = items;
        order.payments = payments;
        order.payment_summary = {
          total_paid: totalPaid,
          total_price: order.total_price,
          is_lunas: isLunas,
        };
      }

      res.json({
        success: true,
        data: { orders },
      });
    } catch (err) {
      console.error("Admin Orders Error:", err);
      res.status(500).json({
        success: false,
        message: "Gagal mengambil order admin",
      });
    }
  }

  // =====================================================================
  // CATEGORY SECTION
  // =====================================================================

  static async getAllCategories(req, res) {
    try {
      const sql = `
      SELECT 
        c.id AS category_id, 
        c.name AS category_name,
        sc.id AS subcategory_id,
        sc.name AS subcategory_name
      FROM categories c
      LEFT JOIN subcategories sc ON sc.category_id = c.id
      ORDER BY c.id ASC
    `;

      db.query(sql, (err, result) => {
        if (err) {
          return res
            .status(500)
            .json({ success: false, message: "Gagal mengambil kategori", err });
        }

        const data = {};
        result.forEach((row) => {
          if (!data[row.category_id]) {
            data[row.category_id] = {
              id: row.category_id,
              name: row.category_name,
              subcategories: [],
            };
          }
          if (row.subcategory_id) {
            data[row.category_id].subcategories.push({
              id: row.subcategory_id,
              name: row.subcategory_name,
            });
          }
        });

        res.json({ success: true, data: Object.values(data) });
      });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Internal server error", err });
    }
  }

  static async addCategory(req, res) {
    try {
      const { name } = req.body;

      if (!name) {
        return res
          .status(400)
          .json({ success: false, message: "Nama kategori harus diisi" });
      }

      const sql = `INSERT INTO categories (name, created_at) VALUES (?, NOW())`;

      db.query(sql, [name], (err, result) => {
        if (err) {
          return res
            .status(500)
            .json({ success: false, message: "Gagal tambah kategori", err });
        }

        res.json({
          success: true,
          message: "Kategori berhasil ditambahkan",
          category_id: result.insertId,
        });
      });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Internal server error", err });
    }
  }

  static async addSubcategory(req, res) {
    try {
      const { category_id, name } = req.body;

      if (!category_id || !name) {
        return res
          .status(400)
          .json({ success: false, message: "category_id & name wajib" });
      }

      const sql = `
        INSERT INTO subcategories (category_id, name, created_at)
        VALUES (?, ?, NOW())
      `;

      db.query(sql, [category_id, name], (err, result) => {
        if (err) {
          return res
            .status(500)
            .json({ success: false, message: "Gagal tambah subkategori", err });
        }

        res.json({
          success: true,
          message: "Subkategori berhasil ditambahkan",
          subcategory_id: result.insertId,
        });
      });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Internal server error", err });
    }
  }

  static async editCategory(req, res) {
    try {
      const { id } = req.params;
      const { name } = req.body;

      if (!name) {
        return res
          .status(400)
          .json({ success: false, message: "Nama wajib diisi" });
      }

      const sql = `UPDATE categories SET name = ? WHERE id = ?`;

      db.query(sql, [name, id], (err) => {
        if (err) {
          return res
            .status(500)
            .json({ success: false, message: "Gagal edit kategori", err });
        }

        res.json({ success: true, message: "Kategori berhasil diperbarui" });
      });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Internal server error", err });
    }
  }

  static async deleteCategory(req, res) {
    try {
      const { id } = req.params;

      db.query(
        `DELETE FROM subcategories WHERE category_id = ?`,
        [id],
        (err) => {
          if (err) {
            return res.status(500).json({
              success: false,
              message: "Gagal hapus subkategori",
              err,
            });
          }

          db.query(`DELETE FROM categories WHERE id = ?`, [id], (err2) => {
            if (err2) {
              return res.status(500).json({
                success: false,
                message: "Gagal hapus kategori",
                err2,
              });
            }

            res.json({
              success: true,
              message: "Kategori & subkategori berhasil dihapus",
            });
          });
        }
      );
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Internal server error", err });
    }
  }

  static async getCartSummary(req, res) {
    try {
      const { user_id } = req.params;
      if (!user_id) {
        return res.status(400).json({
          success: false,
          message: "user_id wajib dikirim",
        });
      }

      // 🔑 Ambil role_id user
      const userRow = await new Promise((resolve, reject) => {
        db.query(
          "SELECT role_id FROM users WHERE id = ?",
          [user_id],
          (err, rows) => (err ? reject(err) : resolve(rows[0]))
        );
      });

      if (!userRow) {
        return res
          .status(404)
          .json({ success: false, message: "User tidak ditemukan" });
      }
      const userRoleId = userRow.role_id;

      // ================= AMBIL / BUAT ORDER =================
      // Cari order yang masih "pending" (belum mulai bayar)
      // ================= AMBIL / BUAT ORDER =================
      // Cari order yang masih "pending" DAN BELUM ADA PEMBAYARAN
      let order_id = await new Promise((resolve, reject) => {
        db.query(
          `SELECT o.id
    FROM orders o
    LEFT JOIN payments p ON o.id = p.order_id
    WHERE o.user_id = ? AND o.status = 'pending'
    AND p.id IS NULL
    ORDER BY o.id DESC LIMIT 1`,
          [user_id],
          (err, rows) =>
            err ? reject(err) : resolve(rows.length ? rows[0].id : null)
        );
      });

      // Jika tidak ada order pending tanpa pembayaran → buat order baru
      if (!order_id) {
        const resultInsert = await new Promise((resolve, reject) => {
          db.query(
            "INSERT INTO orders (user_id, total_price, status, created_at) VALUES (?, 0, 'pending', NOW())",
            [user_id],
            (err, result) => (err ? reject(err) : resolve(result))
          );
        });
        order_id = resultInsert.insertId;
      }
      // ================= AMBIL CART =================
      const cartRows = await new Promise((resolve, reject) => {
        db.query(
          `SELECT
          c.id AS cart_id,
          c.quantity,
          p.id AS product_id,
          p.product_name,
          p.regular_price,
          p.discount_price,
          p.images
        FROM carts c
        JOIN products p ON p.id = c.product_id
        WHERE c.user_id = ?`,
          [user_id],
          (err, rows) => (err ? reject(err) : resolve(rows))
        );
      });

      if (cartRows.length === 0) {
        return res.json({
          success: true,
          order_id,
          items: [],
          summary: {
            subtotal: "0.00",
            diskon: "0.00",
            total: "0.00",
          },
        });
      }

      // ================= HITUNG TOTAL BERDASARKAN ROLE =================
      let items = [];
      let subtotal = 0;
      let total_diskon = 0;

      for (const row of cartRows) {
        const regular = parseFloat(row.regular_price);
        const discount_db =
          row.discount_price && row.discount_price !== "0.00"
            ? parseFloat(row.discount_price)
            : 0;

        let price_final, diskon_item;
        if (userRoleId === 2 && discount_db > 0) {
          // Mitra: dapat diskon
          price_final = discount_db;
          diskon_item = regular - discount_db;
        } else {
          // User biasa: tidak dapat diskon
          price_final = regular;
          diskon_item = 0;
        }

        let image = null;
        try {
          image = row.images ? JSON.parse(row.images)[0] : null;
        } catch {}

        items.push({
          cart_id: row.cart_id,
          product_id: row.product_id,
          product_name: row.product_name,
          quantity: row.quantity,
          regular_price: regular.toFixed(2),
          discount_price: discount_db > 0 ? discount_db.toFixed(2) : null,
          price: price_final.toFixed(2),
          discount_amount: diskon_item.toFixed(2),
          total: (price_final * row.quantity).toFixed(2),
          image,
        });

        subtotal += regular * row.quantity; // subtotal selalu dari harga reguler
        total_diskon += diskon_item * row.quantity;
      }

      const total_akhir = subtotal - total_diskon;

      // ================= UPDATE TOTAL KE ORDERS =================
      await new Promise((resolve, reject) => {
        db.query(
          "UPDATE orders SET total_price = ? WHERE id = ?",
          [total_akhir, order_id],
          (err) => (err ? reject(err) : resolve())
        );
      });

      res.json({
        success: true,
        order_id,
        items,
        summary: {
          subtotal: subtotal.toFixed(2),
          diskon: total_diskon.toFixed(2),
          total: total_akhir.toFixed(2),
        },
      });
    } catch (err) {
      console.error("CartSummary Error:", err);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  static async createPayment(req, res) {
    try {
      const {
        order_id,
        payment_type, // dp | pelunasan
        payment_method,
        amount,
      } = req.body;

      const file = req.file;

      if (!order_id || !payment_type || !payment_method || !amount) {
        return res.status(400).json({
          success: false,
          message:
            "order_id, payment_type, payment_method, dan amount wajib diisi",
        });
      }

      if (!file) {
        return res.status(400).json({
          success: false,
          message: "Bukti pembayaran wajib diupload",
        });
      }

      const proofImage = file.filename;

      const queryAsync = (sql, params = []) =>
        new Promise((resolve, reject) => {
          db.query(sql, params, (err, results) =>
            err ? reject(err) : resolve(results)
          );
        });

      // ================= CEK ORDER =================
      const orderRows = await queryAsync(
        "SELECT total_price FROM orders WHERE id = ?",
        [order_id]
      );

      if (orderRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Order tidak ditemukan",
        });
      }

      const totalPrice = Number(orderRows[0].total_price);

      // ================= TOTAL PAYMENT SEBELUMNYA =================
      const paidRows = await queryAsync(
        "SELECT SUM(amount) AS total_paid FROM payments WHERE order_id = ? AND status = 'diterima'",
        [order_id]
      );

      const totalPaid = Number(paidRows[0].total_paid || 0);

      if (totalPaid + Number(amount) > totalPrice) {
        return res.status(400).json({
          success: false,
          message: "Jumlah pembayaran melebihi total harga order",
        });
      }

      // ================= INSERT PAYMENT =================
      await queryAsync(
        `INSERT INTO payments
      (order_id, payment_type, amount, payment_method, proof_image, status, payment_date, created_at)
      VALUES (?, ?, ?, ?, ?, 'pending', NOW(), NOW())`,
        [order_id, payment_type, amount, payment_method, proofImage]
      );

      res.json({
        success: true,
        message: "Pembayaran berhasil dikirim, menunggu verifikasi admin",
        data: {
          order_id,
          payment_type,
          amount,
          payment_method,
          proof_image: proofImage,
          status: "pending",
        },
      });
    } catch (err) {
      console.error("CREATE PAYMENT ERROR:", err);
      res.status(500).json({
        success: false,
        message: "Gagal membuat pembayaran",
      });
    }
  }

  // =====================================================================
  // ORDER SECTION (BACKEND API)
  // =====================================================================

  // ====================== GET ORDER DETAIL ======================
  static async getOrderDetail(req, res) {
    try {
      const { order_id } = req.params;

      if (!order_id) {
        return res.status(400).json({
          success: false,
          message: "Order ID diperlukan",
        });
      }

      // ================= ORDER =================
      const orderRows = await new Promise((resolve, reject) => {
        db.query(
          `SELECT 
          o.id,
          o.order_number,
          o.order_date,
          o.total_price,
          o.status AS order_status,
          o.user_id,

          u.name AS customer_name,
          u.email AS customer_email,
          u.phone AS customer_phone
        FROM orders o
        JOIN users u ON o.user_id = u.id
        WHERE o.id = ?`,
          [order_id],
          (err, rows) => (err ? reject(err) : resolve(rows))
        );
      });

      if (orderRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Order tidak ditemukan",
        });
      }

      const order = orderRows[0];

      // ================= ITEMS =================
      const items = await new Promise((resolve, reject) => {
        db.query(
          `SELECT 
          oi.id AS order_item_id,
          oi.product_id,
          oi.quantity,
          oi.price_per_item,
          oi.discount_per_item,

          p.product_name,
          p.images
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?`,
          [order_id],
          (err, rows) => (err ? reject(err) : resolve(rows))
        );
      });

      const formattedItems = items.map((item) => {
        let images = [];
        try {
          images = item.images ? JSON.parse(item.images) : [];
        } catch {}

        const subtotal = item.quantity * item.price_per_item;
        const total_discount = item.quantity * item.discount_per_item;
        const total = subtotal - total_discount;

        return {
          order_item_id: item.order_item_id,
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          price_per_item: Number(item.price_per_item),
          discount_per_item: Number(item.discount_per_item),
          subtotal,
          total_discount,
          total,
          images,
        };
      });

      // ================= PAYMENTS (AMBIL SEMUA) =================
      const payments = await new Promise((resolve, reject) => {
        db.query(
          `SELECT
          id,
          payment_type,
          amount,
          payment_method,
          proof_image,
          status,
          created_at
        FROM payments
        WHERE order_id = ?
        ORDER BY created_at ASC`,
          [order_id],
          (err, rows) => (err ? reject(err) : resolve(rows))
        );
      });

      const totalPaid = payments.reduce(
        (sum, p) => sum + Number(p.amount || 0),
        0
      );

      const isLunas = totalPaid >= Number(order.total_price);

      // ================= SUMMARY =================
      const subtotal = formattedItems.reduce((s, i) => s + i.subtotal, 0);
      const total_discount = formattedItems.reduce(
        (s, i) => s + i.total_discount,
        0
      );
      const total = formattedItems.reduce((s, i) => s + i.total, 0);

      res.json({
        success: true,
        data: {
          order: {
            id: order.id,
            order_number: order.order_number,
            order_date: order.order_date,
            user_id: order.user_id,
            customer_name: order.customer_name,
            customer_email: order.customer_email,
            customer_phone: order.customer_phone,
            total_price: Number(order.total_price),
            order_status: order.order_status,
            is_lunas: isLunas,
          },
          payments,
          items: formattedItems,
          summary: {
            subtotal,
            total_discount,
            total,
            total_paid: totalPaid,
            matches_order_total:
              Math.abs(total - Number(order.total_price)) < 0.01,
          },
        },
      });
    } catch (err) {
      console.error("Get Order Detail Error:", err);
      res.status(500).json({
        success: false,
        message: "Gagal mengambil detail order",
        error: err.message,
      });
    }
  }

  // ====================== GET USER ORDERS (FINAL FIXED) ======================
  // ====================== GET USER ORDERS (TEMPORARY FIX: INCLUDE ORDERS WITH PAYMENTS) ======================
  static async getUserOrders(req, res) {
    try {
      const { user_id } = req.params;
      if (!user_id) {
        return res.status(400).json({
          success: false,
          message: "User ID diperlukan",
        });
      }

      // Ambil order yang punya item ATAU punya payment
      const orders = await new Promise((resolve, reject) => {
        db.query(
          `SELECT DISTINCT o.id, o.total_price, o.status, o.created_at
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN payments p ON o.id = p.order_id
        WHERE o.user_id = ?
        AND (oi.id IS NOT NULL OR p.id IS NOT NULL)
        ORDER BY o.created_at DESC`,
          [user_id],
          (err, rows) => (err ? reject(err) : resolve(rows))
        );
      });

      // Ambil detail untuk setiap order
      for (let order of orders) {
        // Ambil items
        const items = await new Promise((resolve, reject) => {
          db.query(
            `SELECT
          oi.id, oi.product_id, oi.quantity,
          p.product_name, p.images,
          oi.price_per_item, oi.discount_per_item
          FROM order_items oi
          JOIN products p ON p.id = oi.product_id
          WHERE oi.order_id = ?`,
            [order.id],
            (err, rows) => (err ? reject(err) : resolve(rows))
          );
        });
        order.items = items;

        // Ambil payments
        const payments = await new Promise((resolve, reject) => {
          db.query(
            `SELECT * FROM payments WHERE order_id = ? ORDER BY id ASC`,
            [order.id],
            (err, rows) => (err ? reject(err) : resolve(rows))
          );
        });
        order.payments = payments;
      }

      res.json({
        success: true,
        data: { orders },
      });
    } catch (err) {
      console.error("Get User Orders Error:", err);
      res.status(500).json({
        success: false,
        message: "Gagal mengambil pesanan pengguna",
      });
    }
  }

  // ====================== GET ORDER INVOICE ======================
  static async getOrderInvoice(req, res) {
    try {
      const { order_id } = req.params;
      if (!order_id) {
        return res.status(400).json({
          success: false,
          message: "Order ID diperlukan",
        });
      }

      // Query untuk mendapatkan data invoice
      const invoiceQuery = `
      SELECT
        o.id,
        o.order_number,
        o.order_date,
        o.total_price,
        u.name AS customer_name,
        u.email AS customer_email,
        u.phone AS customer_phone,
        u.address AS customer_address,
        p.payment_method,
        p.payment_type,
        p.amount AS payment_amount,
        p.payment_date,
        p.proof_image,
        p.status AS payment_status,
        p.confirmed_at,
        s.courier_name,
        s.tracking_number,
        s.shipping_cost,
        s.shipping_date
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN payments p ON o.id = p.order_id
      LEFT JOIN shippings s ON o.id = s.order_id
      WHERE o.id = ?
    `;
      const invoiceResult = await new Promise((resolve, reject) => {
        db.execute(invoiceQuery, [order_id], (error, results) => {
          error ? reject(error) : resolve(results);
        });
      });

      if (invoiceResult.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Invoice tidak ditemukan",
        });
      }

      // Query untuk mendapatkan items
      const itemsQuery = `
      SELECT
        p.product_name,
        oi.quantity,
        oi.price_per_item,
        oi.discount_per_item,
        (oi.price_per_item - oi.discount_per_item) AS final_price,
        (oi.quantity * oi.price_per_item) AS subtotal,
        (oi.quantity * oi.discount_per_item) AS total_discount,
        (oi.quantity * (oi.price_per_item - oi.discount_per_item)) AS total
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `;
      const itemsResult = await new Promise((resolve, reject) => {
        db.execute(itemsQuery, [order_id], (error, results) => {
          error ? reject(error) : resolve(results);
        });
      });

      const invoice = invoiceResult[0];

      // Hitung totals
      const subtotal = itemsResult.reduce(
        (sum, item) => sum + parseFloat(item.subtotal),
        0
      );
      const total_discount = itemsResult.reduce(
        (sum, item) => sum + parseFloat(item.total_discount),
        0
      );
      const total_items = itemsResult.reduce(
        (sum, item) => sum + parseFloat(item.total),
        0
      );
      const shipping_cost = parseFloat(invoice.shipping_cost || 0);
      const grand_total = total_items + shipping_cost;

      // ✅ Pastikan semua field ada dan tidak undefined
      const safeInvoice = {
        id: invoice.id,
        order_number: invoice.order_number || null,
        order_date: invoice.order_date || null,
        total_price: parseFloat(invoice.total_price) || 0,
        payment_date: invoice.payment_date || null,
        payment_status: invoice.payment_status || "pending",
        confirmed_at: invoice.confirmed_at || null,

        customer: {
          name: invoice.customer_name || "Customer Tidak Diketahui",
          email: invoice.customer_email || "-",
          phone: invoice.customer_phone || "-",
          address: invoice.customer_address || "-",
        },

        payment: {
          method: invoice.payment_method || "-",
          type: invoice.payment_type || "-",
          amount: parseFloat(invoice.payment_amount) || 0,
          proof_image: invoice.proof_image || null,
        },

        shipping: {
          courier: invoice.courier_name || "-",
          tracking_number: invoice.tracking_number || "-",
          shipping_date: invoice.shipping_date || null,
          shipping_cost: shipping_cost,
        },

        items: itemsResult.map((item) => ({
          product_name: item.product_name || "Produk Tidak Diketahui",
          quantity: parseInt(item.quantity) || 0,
          price_per_item: parseFloat(item.price_per_item) || 0,
          discount_per_item: parseFloat(item.discount_per_item) || 0,
          final_price: parseFloat(item.final_price) || 0,
          subtotal: parseFloat(item.subtotal) || 0,
          total_discount: parseFloat(item.total_discount) || 0,
          total: parseFloat(item.total) || 0,
        })),

        summary: {
          subtotal: subtotal,
          total_discount: total_discount,
          total_items: total_items,
          shipping_cost: shipping_cost,
          grand_total: grand_total,
        },
      };

      res.json({
        success: true,
        data: {
          invoice: safeInvoice,
        },
      });
    } catch (err) {
      console.error("Get Order Invoice Error:", err);
      res.status(500).json({
        success: false,
        message: "Gagal mengambil invoice",
        error: err.message,
      });
    }
  }

  // ====================== UPDATE ORDER STATUS ======================
  static async updateOrderStatus(req, res) {
    try {
      const { order_id } = req.params;
      const { status } = req.body;

      if (!order_id || !status) {
        return res.status(400).json({
          success: false,
          message: "Order ID dan status diperlukan",
        });
      }

      // Validasi status
      const validStatuses = ["belum dibayar", "dikemas", "dikirim", "selesai"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Status tidak valid. Harus salah satu dari: ${validStatuses.join(
            ", "
          )}`,
        });
      }

      // Update status order
      const updateQuery = `
      UPDATE orders 
      SET 
        status = ?,
        updated_at = NOW()
      WHERE id = ?
    `;

      const result = await new Promise((resolve, reject) => {
        db.execute(updateQuery, [status, order_id], (error, results) => {
          error ? reject(error) : resolve(results);
        });
      });

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Order tidak ditemukan",
        });
      }

      res.json({
        success: true,
        message: "Status order berhasil diperbarui",
        data: {
          order_id,
          status,
          updated_at: new Date().toISOString(),
        },
      });
    } catch (err) {
      console.error("Update Order Status Error:", err);
      res.status(500).json({
        success: false,
        message: "Gagal memperbarui status order",
        error: err.message,
      });
    }
  }

  static async adminGetAllPayments(req, res) {
    try {
      const sql = `
      SELECT
        p.id AS payment_id,
        p.order_id,
        p.payment_type,
        p.amount,
        p.payment_method,
        p.proof_image,
        p.status AS payment_status,
        p.status_dp,
        p.status_pelunasan,
        p.payment_date,
        u.name AS user_name,
        o.total_price AS total_harga  -- ✅ AMBIL TOTAL HARGA DARI TABEL ORDERS
      FROM payments p
      JOIN orders o ON p.order_id = o.id
      JOIN users u ON o.user_id = u.id
      ORDER BY p.id DESC
    `;
      const payments = await new Promise((resolve, reject) => {
        db.query(sql, (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

      const fixImagePath = (img) => {
        if (!img) return null;
        if (img.includes("uploads/payments")) return "/" + img;
        return `/uploads/payments/${img}`;
      };

      const formatted = payments.map((row) => ({
        payment_id: row.payment_id,
        order_id: row.order_id,
        user_name: row.user_name,
        total_harga: row.total_harga, // ✅ Sudah dari database, tidak perlu hitung ulang
        bukti_dp:
          row.payment_type === "dp1" ? fixImagePath(row.proof_image) : null,
        status_dp: row.payment_type === "dp1" ? row.status_dp : "",
        bukti_pelunasan:
          row.payment_type === "dp2" ? fixImagePath(row.proof_image) : null,
        status_pelunasan:
          row.payment_type === "dp2" ? row.status_pelunasan : "",
        payment_method: row.payment_method,
        payment_type: row.payment_type,
        payment_date: row.payment_date,
      }));

      res.json({ success: true, data: formatted });
    } catch (err) {
      console.error("ADMIN GET PAYMENTS ERROR:", err);
      res
        .status(500)
        .json({ success: false, message: "Gagal mengambil data pembayaran" });
    }
  }

  // ====================== UPDATE PAYMENT STATUS (ADMIN) ======================
  static async adminUpdateDPStatus(req, res) {
    try {
      const { payment_id } = req.params;
      const { status_dp } = req.body;

      const valid = ["pending", "diterima", "ditolak"];
      if (!valid.includes(status_dp)) {
        return res.status(400).json({
          success: false,
          message: "Status DP tidak valid",
        });
      }

      const sql = `
      UPDATE payments
      SET status_dp = ?, dp_confirmed_at = NOW()
      WHERE id = ?
    `;

      const result = await new Promise((resolve, reject) => {
        db.query(sql, [status_dp, payment_id], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Payment tidak ditemukan",
        });
      }

      res.json({
        success: true,
        message: "Status DP berhasil diperbarui",
        payment_id,
        status_dp,
      });
    } catch (err) {
      console.error("UPDATE DP ERROR:", err);
      res.status(500).json({
        success: false,
        message: "Gagal update status DP",
        error: err,
      });
    }
  }
  static async adminUpdatePelunasanStatus(req, res) {
    try {
      const { payment_id } = req.params;
      const { status_pelunasan } = req.body;

      const valid = ["pending", "diterima", "ditolak"];
      if (!valid.includes(status_pelunasan)) {
        return res.status(400).json({
          success: false,
          message: "Status Pelunasan tidak valid",
        });
      }

      const sql = `
      UPDATE payments
      SET status_pelunasan = ?, pelunasan_confirmed_at = NOW()
      WHERE id = ?
    `;

      const result = await new Promise((resolve, reject) => {
        db.query(sql, [status_pelunasan, payment_id], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Payment tidak ditemukan",
        });
      }

      res.json({
        success: true,
        message: "Status pelunasan berhasil diperbarui",
        payment_id,
        status_pelunasan,
      });
    } catch (err) {
      console.error("UPDATE PELUNASAN ERROR:", err);
      res.status(500).json({
        success: false,
        message: "Gagal update status pelunasan",
        error: err,
      });
    }
  }
  static async getDashboardSummary(req, res) {
    try {
      // 1. TOTAL PRODUK
      const totalProducts = await new Promise((resolve, reject) => {
        db.execute(
          "SELECT COUNT(*) as total FROM products WHERE is_available = 1",
          (error, results) =>
            error ? reject(error) : resolve(results[0]?.total || 0)
        );
      });

      // 2. TOTAL ORDER
      const totalOrders = await new Promise((resolve, reject) => {
        db.execute("SELECT COUNT(*) as total FROM orders", (error, results) =>
          error ? reject(error) : resolve(results[0]?.total || 0)
        );
      });

      // 3. TOTAL USER (MITRA + USER)
      const totalUsers = await new Promise((resolve, reject) => {
        db.execute(
          `SELECT 
          COUNT(CASE WHEN role_id = 2 THEN 1 END) as mitra_count,
          COUNT(CASE WHEN role_id = 1 THEN 1 END) as user_count
        FROM users`,
          (error, results) => {
            if (error) reject(error);
            else resolve(results[0] || { mitra_count: 0, user_count: 0 });
          }
        );
      });

      // 4. TOTAL PENDAPATAN (SEMUA ORDER - termasuk dikemas, selesai, dll)
      const totalRevenue = await new Promise((resolve, reject) => {
        db.execute(
          "SELECT COALESCE(SUM(total_price), 0) as revenue FROM orders",
          (error, results) =>
            error ? reject(error) : resolve(results[0]?.revenue || 0)
        );
      });

      // 5. PENDAPATAN PER STATUS (untuk breakdown)
      const revenueByStatus = await new Promise((resolve, reject) => {
        db.execute(
          "SELECT status, COALESCE(SUM(total_price), 0) as revenue, COUNT(*) as order_count FROM orders GROUP BY status",
          (error, results) => (error ? reject(error) : resolve(results || []))
        );
      });

      res.json({
        success: true,
        data: {
          total_product: parseInt(totalProducts),
          total_order: parseInt(totalOrders),
          total_user: {
            mitra: parseInt(totalUsers.mitra_count),
            user: parseInt(totalUsers.user_count),
            total:
              parseInt(totalUsers.mitra_count) +
              parseInt(totalUsers.user_count),
          },
          total_pendapatan: parseFloat(totalRevenue),
          breakdown_pendapatan: revenueByStatus.map((item) => ({
            status: item.status,
            pendapatan: parseFloat(item.revenue),
            jumlah_order: parseInt(item.order_count),
          })),
        },
      });
    } catch (err) {
      console.error("Dashboard Summary Error:", err);
      res.status(500).json({
        success: false,
        message: "Gagal mengambil data dashboard",
      });
    }
  }
}

module.exports = ProductController;
