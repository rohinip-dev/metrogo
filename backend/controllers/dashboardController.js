const User = require("../models/User");
const Booking = require("../models/Booking");
const { calculateCarbonSaved } = require("../utils/carbonCalculator");
const { calculateStreaks, calculateBadges } = require("../utils/streakCalculator");

const getDashboardData = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const allBookings = await Booking.find({ user: req.user.id }).sort({ createdAt: -1 });
    const recentBookings = allBookings.slice(0, 3);

    const confirmedBookings = allBookings.filter((b) => b.status !== "cancelled");
    const totalTrips = confirmedBookings.length;
    const totalSpent = confirmedBookings.reduce((sum, b) => sum + b.fare, 0);
    const totalDistanceKm = confirmedBookings.reduce((sum, b) => sum + b.distanceKm, 0);
    const carbon = calculateCarbonSaved(totalDistanceKm);
        // Streak: based on the dates confirmed bookings were made
    const bookingDates = confirmedBookings.map((b) => b.createdAt);
    const streaks = calculateStreaks(bookingDates);

    // Unique stations visited (counting both source and destination)
    const stationSet = new Set();
    confirmedBookings.forEach((b) => {
      stationSet.add(b.source);
      stationSet.add(b.destination);
    });

    // How many distinct lines they've traveled on
    const lineSet = new Set();
    confirmedBookings.forEach((b) => {
      lineSet.add(b.sourceLine);
      lineSet.add(b.destinationLine);
    });

    const badges = calculateBadges({
      totalTrips,
      uniqueStations: stationSet.size,
      linesUsed: lineSet.size,
      currentStreak: streaks.currentStreak,
      carbonSavedKg: carbon.savedKg,
    });
    res.status(200).json({
      user: {
        name: user.name,
        email: user.email,
        walletBalance: user.walletBalance,
      },
                stats: {
        totalTrips,
        totalSpent,
        totalDistanceKm: Number(totalDistanceKm.toFixed(1)),
        carbonSavedKg: carbon.savedKg,
        currentStreak: streaks.currentStreak,
        longestStreak: streaks.longestStreak,
        uniqueStations: stationSet.size,
      },
      badges,
      recentBookings,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getDashboardData };