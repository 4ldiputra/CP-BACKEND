const express = require("express");
const router = express.Router();
const ProductController = require("../controllers/productController");
const { requireAuth } = require("../middleware/auth");
const uploadProduct = require("../middleware/uploadProduct");
const uploadPayment = require("../middleware/uploadPayment");

// ============================
//         PRODUK MITRA
// ============================

// GET ALL PRODUK MITRA
router.get("/mitra", requireAuth, ProductController.getProductsMitra);
router.get("/admin/orders", requireAuth, ProductController.getAllOrders); // 👈 Tambahkan ini

// GET DETAIL PRODUK MITRA (‼ WAJIB SEBELUM PUT/DELETE)
router.get(
  "/mitra/:id",
  requireAuth,
  ProductController.getProductDetailMitra
);

// UPLOAD PRODUK MITRA
router.post(
  "/mitra",
  requireAuth,
  uploadProduct.array("images", 10),
  ProductController.uploadProductMitra
);

// EDIT PRODUK MITRA
router.put(
  "/mitra/:id",
  requireAuth,
  uploadProduct.array("images", 10),
  ProductController.editProductMitra
);

// DELETE PRODUK MITRA
router.delete(
  "/mitra/:id",
  requireAuth,
  ProductController.deleteProductMitra
);


// ============================
//         PRODUK USER
// ============================

// GET ALL PRODUK USER
router.get("/user", requireAuth, ProductController.getProductsUser);

// GET DETAIL PRODUK USER
router.get(
  "/user/:id",
  requireAuth,
  ProductController.getProductDetailUser
);

// UPLOAD PRODUK USER
router.post(
  "/user",
  requireAuth,
  uploadProduct.array("images", 10),
  ProductController.uploadProductUser
);

// EDIT PRODUK USER
router.put(
  "/user/:id",
  requireAuth,
  uploadProduct.array("images", 10),
  ProductController.editProductUser
);

// DELETE PRODUK USER
router.delete(
  "/user/:id",
  requireAuth,
  ProductController.deleteProductUser
);


// ============================
//        CATEGORIES
// ============================
router.get("/categories", ProductController.getAllCategories);
router.post("/categories", ProductController.addCategory);
router.put("/categories/:id", ProductController.editCategory);
router.delete("/categories/:id", ProductController.deleteCategory);

// ============================
//        SUBCATEGORIES
// ============================
router.post("/subcategories", ProductController.addSubcategory);

// ============================
//       ORDER SUMMARY
// ============================
router.get("/cart-summary/:user_id", ProductController.getCartSummary);
router.post(
  "/payment",
  uploadPayment.single("proof_image"),
  ProductController.createPayment
);
router.get('/order/:order_id', ProductController.getOrderDetail);
router.get('/user/:user_id/orders', ProductController.getUserOrders);
router.get('/order/:order_id/invoice', ProductController.getOrderInvoice);
router.put('/order/:order_id/status', ProductController.updateOrderStatus);
router.get("/admin/payments", ProductController.adminGetAllPayments);
router.put("/admin/payment/dp/:payment_id", ProductController.adminUpdateDPStatus);
router.put("/admin/payment/pelunasan/:payment_id", ProductController.adminUpdatePelunasanStatus);
router.get("/dashboard/summary", ProductController.getDashboardSummary);
module.exports = router;