const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/orderController');

// Test route
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Order routes working!' });
});

// Create order
router.post('/create', OrderController.createOrder);

module.exports = router;