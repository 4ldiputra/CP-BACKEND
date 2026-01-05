const db = require("../config/database");

class CartController {
  // =========================
  // GET CART
  // =========================
  static async getCart(req, res) {
    try {
      const userId = req.session && req.session.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      // ✅ TAMBAHKAN p.description dan p.specifications di sini
      const sql = `
      SELECT 
        c.id AS cart_id,
        c.quantity,
        c.price,
        c.discount_amount,
        (c.price * c.quantity) AS total,
        p.id AS product_id,
        p.product_name,
        p.regular_price,
        p.discount_price,
        p.images,
        p.description,            -- ✅ DITAMBAHKAN
        p.specifications          -- ✅ DITAMBAHKAN
      FROM carts c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
    `;

      db.query(sql, [userId], (err, results) => {
        if (err) {
          return res.status(500).json({ success: false, error: err });
        }

        // ✅ Parse images, tapi biarkan description & specifications tetap ada
        results = results.map((item) => {
          let image = null;

          try {
            const imgs = JSON.parse(item.images || "[]");
            if (imgs.length > 0) {
              image = `/uploads/products/${imgs[0]}`;
            }
          } catch (e) {
            image = null;
          }

          return {
            ...item,
            image, // frontend pakai ini
            // description & specifications otomatis ikut karena ...item
          };
        });

        // Hitung total
        let subtotal = 0;
        let diskon = 0;
        let total = 0;

        results.forEach((item) => {
          const price = parseFloat(item.price) || 0;
          const quantity = parseInt(item.quantity) || 0;
          const itemDiskon = parseFloat(item.discount_amount) || 0;

          subtotal += price * quantity;
          diskon += itemDiskon;
        });

        total = subtotal - diskon;

        subtotal = Math.round(subtotal * 100) / 100;
        diskon = Math.round(diskon * 100) / 100;
        total = Math.round(total * 100) / 100;

        res.json({
          success: true,
          items: results,
          summary: { subtotal, diskon, total },
        });
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error", error });
    }
  }

  // =========================
  // GET CART COUNT
  // =========================
  static async getCartCount(req, res) {
    try {
      const userId = req.session && req.session.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const sql = `
        SELECT 
          COUNT(*) as total_items,
          COALESCE(SUM(quantity), 0) as total_quantity
        FROM carts 
        WHERE user_id = ?
      `;

      db.query(sql, [userId], (err, results) => {
        if (err) return res.status(500).json({ success: false, error: err });

        const cartCount = results[0] || { total_items: 0, total_quantity: 0 };

        res.json({
          success: true,
          data: {
            total_items: parseInt(cartCount.total_items),
            total_quantity: parseInt(cartCount.total_quantity),
          },
        });
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error", error });
    }
  }

  // =========================
  // ADD TO CART
  // =========================
  static async addToCart(req, res) {
    try {
      const userId = req.session && req.session.userId;
      const { product_id, quantity } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
          'Authentication required',
        });
      }
      if (!product_id || !quantity) {
        return res.status(400).json({
          success: false,
          message: 'product_id and quantity are required',
        });
      }

      db.query(
        "SELECT role_id FROM users WHERE id = ?",
        [userId],
        (err, userRows) => {
          if (err) return res.status(500).json({ success: false, error: err });
          if (!userRows.length)
            return res
              .status(404)
              .json({ success: false, message: "User not found" });

          const userRoleId = userRows[0].role_id;

          db.query(
            "SELECT id, regular_price, discount_price FROM products WHERE id = ?",
            [product_id],
            (err, productRows) => {
              if (err)
                return res.status(500).json({ success: false, error: err });
              if (!productRows.length)
                return res
                  .status(404)
                  .json({ success: false, message: "Product not found" });

              const product = productRows[0];
              let price =
                userRoleId === 2
                  ? product.discount_price || product.regular_price
                  : product.regular_price;

              price = parseFloat(price);
              const subtotal = price * quantity;

              db.query(
                "SELECT id, quantity FROM carts WHERE user_id = ? AND product_id = ?",
                [userId, product.id],
                (err, cartRows) => {
                  if (err)
                    return res.status(500).json({ success: false, error: err });

                  if (cartRows.length) {
                    const existing = cartRows[0];
                    const newQty = existing.quantity + quantity;
                    const newSubtotal = price * newQty;

                    db.query(
                      "UPDATE carts SET quantity = ?, price = ?, subtotal = ? WHERE id = ?",
                      [newQty, price, newSubtotal, existing.id],
                      () =>
                        res.json({
                          success: true,
                          message: "Quantity updated in cart",
                        })
                    );
                  } else {
                    db.query(
                      "INSERT INTO carts (user_id, product_id, quantity, price, subtotal) VALUES (?, ?, ?, ?, ?)",
                      [userId, product.id, quantity, price, subtotal],
                      () =>
                        res.json({
                          success: true,
                          message: "Product added to cart",
                        })
                    );
                  }
                }
              );
            }
          );
        }
      );
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error", error });
    }
  }

  // =========================
  // UPDATE CART ITEM
  // =========================
  static async updateCartItem(req, res) {
    try {
      const userId = req.session && req.session.userId;
      const cartId = req.params.id;
      const { quantity } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }
      if (!quantity) {
        return res.status(400).json({
          success: false,
          message: 'Invalid request',
        });
      }

      db.query(
        "SELECT price FROM carts WHERE id = ? AND user_id = ?",
        [cartId, userId],
        (err, rows) => {
          if (err || !rows.length)
            return res
              .status(404)
              .json({ success: false, message: "Cart item not found" });

          const price = parseFloat(rows[0].price);
          const subtotal = price * quantity;

          db.query(
            "UPDATE carts SET quantity = ?, subtotal = ? WHERE id = ?",
            [quantity, subtotal, cartId],
            () => res.json({ success: true, message: "Cart updated" })
          );
        }
      );
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error", error });
    }
  }

  // =========================
  // REMOVE ITEM
  // =========================
  static async removeCartItem(req, res) {
    try {
      const userId = req.session && req.session.userId;
      const cartId = req.params.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      db.query(
        "DELETE FROM carts WHERE id = ? AND user_id = ?",
        [cartId, userId],
        () => res.json({ success: true, message: "Item removed" })
      );
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error", error });
    }
  }
}

module.exports = CartController;
