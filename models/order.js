const db = require('../config/database');

class Order {
  static async create(data) {
    const query = `
      INSERT INTO orders (
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
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      data.user_id,
      data.distributor_id,
      data.order_code,
      data.total_amount,
      data.discount_total,
      data.final_amount,
      data.shipping_first_name,
      data.shipping_last_name,
      data.shipping_city,
      data.shipping_province,
      data.shipping_postal_code,
      data.shipping_address
    ];

    return db.execute(query, values);
  }
}

module.exports = Order;
