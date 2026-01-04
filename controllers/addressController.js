// baru menambahkan alamat
const Address = require('../models/address');
const db = require('../config/database');

const addressController = {
  // GET - Ambil semua alamat user
  getAllAddresses: async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const addresses = await Address.findByUserId(userId);
      res.json({
        success: true,
        data: addresses
      });
    } catch (error) {
      console.error('Error fetching addresses:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error fetching addresses' 
      });
    }
  },

  // GET - Ambil alamat default
  getDefaultAddress: async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const address = await Address.findDefaultByUserId(userId);
      res.json({
        success: true,
        data: address || null
      });
    } catch (error) {
      console.error('Error fetching default address:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error fetching default address' 
      });
    }
  },

  // POST - Tambah alamat baru
  createAddress: async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { name, phone, city_id, province_id, postal_code, full_address, is_default } = req.body;

      // Validasi input
      if (!name || !phone || !city_id || !province_id || !postal_code || !full_address) {
        return res.status(400).json({
          success: false,
          message: 'Semua field harus diisi'
        });
      }

      // Validasi kode pos (5 digit)
      if (!/^\d{5}$/.test(postal_code)) {
        return res.status(400).json({
          success: false,
          message: 'Kode pos harus 5 digit angka'
        });
      }

      // Validasi nomor HP
      if (!/^[0-9]{10,15}$/.test(phone)) {
        return res.status(400).json({
          success: false,
          message: 'Nomor HP tidak valid'
        });
      }

      const addressData = {
        user_id: userId,
        name,
        phone,
        city_id,
        province_id,
        postal_code,
        full_address,
        is_default: is_default ? 1 : 0
      };

      // Jika ini alamat default, reset alamat lain
      if (is_default) {
        await new Promise((resolve, reject) => {
          db.query(
            'UPDATE user_addresses SET is_default = 0 WHERE user_id = ?',
            [userId],
            (err) => {
              if (err) reject(err);
              resolve();
            }
          );
        });
      }

      // Jika ini alamat pertama, set otomatis jadi default
      const existingAddresses = await Address.findByUserId(userId);
      if (existingAddresses.length === 0) {
        addressData.is_default = 1;
      }

      const result = await Address.create(addressData);

      res.json({
        success: true,
        message: 'Alamat berhasil ditambahkan',
        data: { id: result.insertId }
      });
    } catch (error) {
      console.error('Error creating address:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating address'
      });
    }
  },

  // PUT - Update alamat
  updateAddress: async (req, res) => {
    try {
      const userId = req.session.userId;
      const addressId = req.params.id;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { name, phone, city_id, province_id, postal_code, full_address, is_default } = req.body;

      // Validasi input
      if (!name || !phone || !city_id || !province_id || !postal_code || !full_address) {
        return res.status(400).json({
          success: false,
          message: 'Semua field harus diisi'
        });
      }

      // Validasi kode pos
      if (!/^\d{5}$/.test(postal_code)) {
        return res.status(400).json({
          success: false,
          message: 'Kode pos harus 5 digit angka'
        });
      }

      // Validasi nomor HP
      if (!/^[0-9]{10,15}$/.test(phone)) {
        return res.status(400).json({
          success: false,
          message: 'Nomor HP tidak valid'
        });
      }

      const addressData = {
        name,
        phone,
        city_id,
        province_id,
        postal_code,
        full_address,
        is_default: is_default ? 1 : 0
      };

      // Jika set sebagai default, reset alamat lain
      if (is_default) {
        await new Promise((resolve, reject) => {
          db.query(
            'UPDATE user_addresses SET is_default = 0 WHERE user_id = ?',
            [userId],
            (err) => {
              if (err) reject(err);
              resolve();
            }
          );
        });
      }

      await Address.update(addressId, userId, addressData);

      res.json({
        success: true,
        message: 'Alamat berhasil diupdate'
      });
    } catch (error) {
      console.error('Error updating address:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating address'
      });
    }
  },

  // DELETE - Hapus alamat
  deleteAddress: async (req, res) => {
    try {
      const userId = req.session.userId;
      const addressId = req.params.id;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      await Address.delete(addressId, userId);

      res.json({
        success: true,
        message: 'Alamat berhasil dihapus'
      });
    } catch (error) {
      console.error('Error deleting address:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting address'
      });
    }
  },

  // PUT - Set alamat sebagai default
  setDefaultAddress: async (req, res) => {
    try {
      const userId = req.session.userId;
      const addressId = req.params.id;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      await Address.setDefault(addressId, userId);

      res.json({
        success: true,
        message: 'Alamat default berhasil diubah'
      });
    } catch (error) {
      console.error('Error setting default address:', error);
      res.status(500).json({
        success: false,
        message: 'Error setting default address'
      });
    }
  },

  // GET - Ambil data provinsi
  getProvinces: async (req, res) => {
    try {
      const provinces = await new Promise((resolve, reject) => {
        db.query('SELECT * FROM provinces ORDER BY name', (err, results) => {
          if (err) reject(err);
          resolve(results);
        });
      });

      res.json({
        success: true,
        data: provinces
      });
    } catch (error) {
      console.error('Error fetching provinces:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching provinces'
      });
    }
  },

  // GET - Ambil data kota berdasarkan provinsi
  getCitiesByProvince: async (req, res) => {
    try {
      const provinceId = req.params.provinceId;

      const cities = await new Promise((resolve, reject) => {
        db.query(
          'SELECT * FROM cities WHERE province_id = ? ORDER BY name',
          [provinceId],
          (err, results) => {
            if (err) reject(err);
            resolve(results);
          }
        );
      });

      res.json({
        success: true,
        data: cities
      });
    } catch (error) {
      console.error('Error fetching cities:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching cities'
      });
    }
  }
};

module.exports = addressController;