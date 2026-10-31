const EmergencyAlert = require("../models/EmergencyAlert");
const User = require("../models/User");
const { notify } = require("../utils/notify");

// ===== TRIGGER AN SOS ALERT =====
const triggerSOS = async (req, res) => {
  try {
    const { message } = req.body;
    const user = await User.findById(req.user.id);

       const alert = await EmergencyAlert.create({
      user: req.user.id,
      userName: user.name,
      message: message || "SOS button pressed",
    });

    await notify(
      req.user.id,
      "emergency",
      "Emergency alert sent",
      "Your SOS alert was received. Station staff have been notified."
    );

    res.status(201).json({ message: "Emergency alert sent. Station staff have been notified.", alert });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== GET ALL ACTIVE ALERTS (for admin) =====
const getActiveAlerts = async (req, res) => {
  try {
    const alerts = await EmergencyAlert.find({ status: "active" }).sort({ createdAt: -1 });
    res.status(200).json(alerts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== MARK AN ALERT AS RESOLVED (for admin) =====
const resolveAlert = async (req, res) => {
  try {
    const alert = await EmergencyAlert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }
    alert.status = "resolved";
    await alert.save();
    res.status(200).json({ message: "Alert marked as resolved", alert });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { triggerSOS, getActiveAlerts, resolveAlert };