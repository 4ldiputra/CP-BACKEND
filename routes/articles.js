const express = require("express");
const router = express.Router();
const ArticleController = require("../controllers/ArticleController");
const upload = require("../middleware/uploadArticle");

// Rute-rute
router.get("/", ArticleController.getAllArticles);
router.get("/active", ArticleController.getActiveArticles);
router.get("/:id", ArticleController.getArticleById); // Opsional

// Rute upload dengan middleware upload langsung
router.post("/upload", upload, ArticleController.uploadArticle);

router.put("/status/:id", ArticleController.updateStatus);
router.delete("/:id", ArticleController.deleteArticle);

module.exports = router;