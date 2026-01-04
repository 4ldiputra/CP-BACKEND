const Order = require('../models/order');

class OrderController {
  static async createOrder(req, res) {
    try {
      const {
        user_id,
        distributor_id,
        order_code,
        total_amount,
        discount_total,
        final_amount,

        // alamat pengiriman
        shipping_first_name,
        shipping_last_name,
        shipping_city,
        shipping_province,
        shipping_postal_code,
        shipping_address
      } = req.body;

      const newOrder = await Order.create({
        user_id,
        distributor_id,
        order_code,
        total_amount,
        discount_total,
        final_amount,

        shipping_first_name,
        shipping_last_name,
        shipping_city,
        shipping_province,
        shipping_postal_code,
        shipping_address
      });

      return res.json({
        success: true,
        message: "Order created successfully",
        data: newOrder
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
}

module.exports = OrderController;
