const express = require("express");
const router = express.Router();
const SuggestionController = require("../controllers/SuggestionController");

// ===================== PUBLIC ROUTES =====================
// Siapa saja bisa kirim saran (tanpa login)
router.post("/", SuggestionController.createSuggestion);

// ===================== ADMIN ROUTES =====================
// Admin: Get semua saran
router.get("/", SuggestionController.getAllSuggestions);


module.exports = router;