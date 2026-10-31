const express = require("express");
const router = express.Router();
const { getMonthlySummary } = require("../controllers/monthlySummaryController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getMonthlySummary);

module.exports = router;