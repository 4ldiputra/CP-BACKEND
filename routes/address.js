// baru menambahkan alamat
const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');
const { requireAuth } = require('../middleware/auth');
router.use(requireAuth);


// Address routes
router.get('/', addressController.getAllAddresses);
router.get('/default', addressController.getDefaultAddress);
router.post('/', addressController.createAddress);
router.put('/:id', addressController.updateAddress);
router.delete('/:id', addressController.deleteAddress);
router.put('/:id/default', addressController.setDefaultAddress);

// Location routes
router.get('/provinces', addressController.getProvinces);
router.get('/cities/:provinceId', addressController.getCitiesByProvince);

module.exports = router;