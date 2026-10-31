const express = require("express");
const router = express.Router();
const { createBooking, getMyBookings, cancelBooking, correctJourney } = require("../controllers/bookingController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createBooking);
router.get("/my-bookings", protect, getMyBookings);
router.delete("/:id", protect, cancelBooking);
router.put("/:id/correct", protect, correctJourney);

module.exports = router;