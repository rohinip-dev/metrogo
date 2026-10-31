const Booking = require("../models/Booking");

const getMonthlySummary = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const bookings = await Booking.find({
      user: req.user.id,
      status: { $ne: "cancelled" },
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    });

    if (bookings.length === 0) {
      return res.status(200).json({
        hasTrips: false,
        monthLabel: now.toLocaleString("default", { month: "long", year: "numeric" }),
      });
    }

    const totalTrips = bookings.length;
    const totalSpent = bookings.reduce((sum, b) => sum + b.fare, 0);
    const totalDistanceKm = bookings.reduce((sum, b) => sum + b.distanceKm, 0);
    const totalMinutes = bookings.reduce((sum, b) => sum + b.estimatedTimeMinutes, 0);

    // Most visited station — count every time a station appears as source or destination
    const stationCounts = {};
    bookings.forEach((b) => {
      stationCounts[b.source] = (stationCounts[b.source] || 0) + 1;
      stationCounts[b.destination] = (stationCounts[b.destination] || 0) + 1;
    });
    const topStation = Object.entries(stationCounts).sort((a, b) => b[1] - a[1])[0][0];

    // Most used line
    const lineCounts = {};
    bookings.forEach((b) => {
      lineCounts[b.sourceLine] = (lineCounts[b.sourceLine] || 0) + 1;
      lineCounts[b.destinationLine] = (lineCounts[b.destinationLine] || 0) + 1;
    });
    const topLine = Object.entries(lineCounts).sort((a, b) => b[1] - a[1])[0][0];

    // Busiest single day of the month
    const dayCounts = {};
    bookings.forEach((b) => {
      const day = new Date(b.createdAt).toISOString().split("T")[0];
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });
    const busiestDayEntry = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0];

    // Favorite time of day to travel
    const hourBuckets = { Morning: 0, Afternoon: 0, Evening: 0, Night: 0 };
    bookings.forEach((b) => {
      const hour = new Date(b.createdAt).getHours();
      if (hour >= 5 && hour < 12) hourBuckets.Morning++;
      else if (hour >= 12 && hour < 17) hourBuckets.Afternoon++;
      else if (hour >= 17 && hour < 21) hourBuckets.Evening++;
      else hourBuckets.Night++;
    });
    const favoriteTimeOfDay = Object.entries(hourBuckets).sort((a, b) => b[1] - a[1])[0][0];

    res.status(200).json({
      hasTrips: true,
      monthLabel: now.toLocaleString("default", { month: "long", year: "numeric" }),
      totalTrips,
      totalSpent,
      totalDistanceKm: Number(totalDistanceKm.toFixed(1)),
      totalMinutes: Math.round(totalMinutes),
      topStation,
      topLine,
      favoriteTimeOfDay,
      busiestDay: {
        date: busiestDayEntry[0],
        trips: busiestDayEntry[1],
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getMonthlySummary };