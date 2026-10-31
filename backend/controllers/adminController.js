const Booking = require("../models/Booking");
const User = require("../models/User");
const Station = require("../models/Station");

// ===== DASHBOARD STATS =====
const getDashboardStats = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const totalUsers = await User.countDocuments();

    const revenueResult = await Booking.aggregate([
      { $group: { _id: null, total: { $sum: "$fare" } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Find the 5 most-booked routes
    const topRoutes = await Booking.aggregate([
      {
        $group: {
          _id: { source: "$source", destination: "$destination" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    res.status(200).json({ totalBookings, totalUsers, totalRevenue, topRoutes });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== ALL BOOKINGS (across every user) =====
const getAllBookings = async (req, res) => {
  try {
    const { status, paymentMethod, station, startDate, endDate, search } = req.query;

    const query = {};

    if (status) query.status = status;
    if (paymentMethod) query.paymentMethod = paymentMethod;

    if (station) {
      // Matches if the station appears as either the source OR destination
      query.$or = [
        { source: new RegExp(station, "i") },
        { destination: new RegExp(station, "i") },
      ];
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        // Include the entire end day, not just midnight
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    let bookings = await Booking.find(query).populate("user", "name email").sort({ createdAt: -1 });

    // Search by user name/email happens after populating, since it's on a linked document
    if (search) {
      const searchLower = search.toLowerCase();
      bookings = bookings.filter(
        (b) =>
          b.user?.name?.toLowerCase().includes(searchLower) ||
          b.user?.email?.toLowerCase().includes(searchLower)
      );
    }

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== STATION MANAGEMENT =====
const createStation = async (req, res) => {
  try {
    const station = await Station.create(req.body);
    res.status(201).json(station);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateStation = async (req, res) => {
  try {
    const station = await Station.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(station);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteStation = async (req, res) => {
  try {
    await Station.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Station deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getDashboardStats, getAllBookings, createStation, updateStation, deleteStation };