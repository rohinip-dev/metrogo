const express = require("express");
const mongoose = require("mongoose");
const dns = require("dns");
const cors = require("cors");
const helmet = require("helmet");

require("dotenv").config();

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB successfully!"))
  .catch((err) => console.log("❌ MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send("Hello, I'm alive! Metro Rail backend is running 🚇");
});

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const stationRoutes = require("./routes/stationRoutes");
app.use("/api/stations", stationRoutes);

const bookingRoutes = require("./routes/bookingRoutes");
app.use("/api/bookings", bookingRoutes);

const adminRoutes = require("./routes/adminRoutes");
app.use("/api/admin", adminRoutes);

const walletRoutes = require("./routes/walletRoutes");
app.use("/api/wallet", walletRoutes);

const alertRoutes = require("./routes/alertRoutes");
app.use("/api/alerts", alertRoutes);

const favoriteRoutes = require("./routes/favoriteRoutes");
app.use("/api/favorites", favoriteRoutes);

const crowdRoutes = require("./routes/crowdRoutes");
app.use("/api/crowd", crowdRoutes);

const dashboardRoutes = require("./routes/dashboardRoutes");
app.use("/api/dashboard", dashboardRoutes);

const lostItemRoutes = require("./routes/lostItemRoutes");
app.use("/api/lost-items", lostItemRoutes);

const intentChatRoutes = require("./routes/intentChatRoutes");
app.use("/api/intent-chat", intentChatRoutes);

const emergencyRoutes = require("./routes/emergencyRoutes");
app.use("/api/emergency", emergencyRoutes);

const monthlySummaryRoutes = require("./routes/monthlySummaryRoutes");
app.use("/api/monthly-summary", monthlySummaryRoutes);

const notificationRoutes = require("./routes/notificationRoutes");
app.use("/api/notifications", notificationRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});