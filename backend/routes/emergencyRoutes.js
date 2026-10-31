const express = require("express");
const router = express.Router();
const { triggerSOS, getActiveAlerts, resolveAlert } = require("../controllers/emergencyController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, triggerSOS);
router.get("/", protect, getActiveAlerts);
router.put("/:id/resolve", protect, resolveAlert);

module.exports = router;