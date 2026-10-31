const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");
const { createAlert, getActiveAlerts, getAllAlerts, deactivateAlert } = require("../controllers/alertController");

// Public — any passenger can see active alerts, no login needed
router.get("/active", getActiveAlerts);

// Admin only
router.post("/", protect, adminOnly, createAlert);
router.get("/", protect, adminOnly, getAllAlerts);
router.put("/:id/deactivate", protect, adminOnly, deactivateAlert);

module.exports = router;