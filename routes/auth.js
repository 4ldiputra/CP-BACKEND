const express = require('express');
const router = express.Router();

const AuthController = require('../controllers/authController');
const CartController = require('../controllers/cartController');
const PaymentController = require('../controllers/paymentController');

const { requireAuth, requireAdmin } = require('../middleware/auth');
const { validateRegister, validateLogin, checkValidation } = require('../middleware/validation');

const upload = require('../middleware/upload');
const uploadPayment = require('../middleware/uploadPayment');

// =======================
// AUTH ROUTES
// =======================

// Register user (frontend)
router.post('/register', validateRegister, checkValidation, AuthController.register);

// Login
router.post('/login', validateLogin, checkValidation, AuthController.login);

// Profile
router.get('/profile', requireAuth, AuthController.getProfile);
router.post('/profile', requireAuth, upload.single('profile_image'), AuthController.updateProfile);


// =======================
// ADMIN USER MANAGEMENT
// =======================

// GET ALL
router.get('/mitra', requireAuth, requireAdmin, AuthController.getAllMitra);
router.get('/user', requireAuth, requireAdmin, AuthController.getAllUser);

// GET DETAIL
router.get('/mitra/:id', requireAuth, requireAdmin, AuthController.getMitraById);
router.get('/user/:id', requireAuth, requireAdmin, AuthController.getUserById);

// ADD
router.post('/mitra', requireAuth, requireAdmin, AuthController.addMitra);
router.post('/user', requireAuth, requireAdmin, AuthController.addUser);

// UPDATE
router.put('/mitra/:id', requireAuth, requireAdmin, AuthController.updateMitraById);
router.put('/user/:id', requireAuth, requireAdmin, AuthController.updateUserById);

// DELETE
router.delete('/mitra/:id', requireAuth, requireAdmin, AuthController.deleteUserById);
router.delete('/user/:id', requireAuth, requireAdmin, AuthController.deleteUserById);


// =======================
// CART ROUTES
// =======================
router.get('/cart/count', requireAuth, CartController.getCartCount);
router.get('/cart', requireAuth, CartController.getCart);
router.post('/cart/add', requireAuth, CartController.addToCart);
router.put('/cart/update/:id', requireAuth, CartController.updateCartItem);
router.delete('/cart/remove/:id', requireAuth, CartController.removeCartItem);



// =======================
// PAYMENT ROUTES
// =======================
router.post('/payment', requireAuth, uploadPayment.single('image'), PaymentController.createPayment);
router.get('/invoice/:order_id', requireAuth, PaymentController.getInvoice);

module.exports = router;