// routes/payment.js
const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/paymentController');
const uploadPayment = require('../middleware/uploadPayment'); 

// === USER ROUTES ===
router.post('/', uploadPayment.single('proof_image'), PaymentController.createPayment);
router.get('/invoice/:order_id', PaymentController.getInvoice);

// === ADMIN ROUTES ===
// ❗ Tapi ini tidak disarankan karena mencampur user & admin
router.put('/admin/payment/dp/:id', PaymentController.updateDP);
router.put('/admin/payment/pelunasan/:id', PaymentController.updatePelunasan);

module.exports = router;