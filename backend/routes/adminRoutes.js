const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");
const {
  getDashboardStats,
  getAllBookings,
  createStation,
  updateStation,
  deleteStation,
} = require("../controllers/adminController");

router.get("/stats", protect, adminOnly, getDashboardStats);
router.get("/bookings", protect, adminOnly, getAllBookings);
router.post("/stations", protect, adminOnly, createStation);
router.put("/stations/:id", protect, adminOnly, updateStation);
router.delete("/stations/:id", protect, adminOnly, deleteStation);

module.exports = router;