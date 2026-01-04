const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/products");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      "product-" + Date.now() + path.extname(file.originalname)
    );
  }
});

const uploadProduct = multer({ storage });

module.exports = uploadProduct;
