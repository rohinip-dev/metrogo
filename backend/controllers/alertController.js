const ServiceAlert = require("../models/ServiceAlert");

// ===== CREATE AN ALERT (admin only) =====
const createAlert = async (req, res) => {
  try {
    const { message, line, severity } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Please enter an alert message" });
    }

    const alert = await ServiceAlert.create({
      message,
      line: line || "General",
      severity: severity || "info",
      createdBy: req.user.id,
    });

    res.status(201).json({ message: "Alert posted successfully", alert });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== GET ACTIVE ALERTS (public — passengers see these) =====
const getActiveAlerts = async (req, res) => {
  try {
    const alerts = await ServiceAlert.find({ isActive: true }).sort({ createdAt: -1 });
    res.status(200).json(alerts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== GET ALL ALERTS (admin only — includes inactive ones) =====
const getAllAlerts = async (req, res) => {
  try {
    const alerts = await ServiceAlert.find().sort({ createdAt: -1 });
    res.status(200).json(alerts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== DEACTIVATE AN ALERT (admin only) =====
const deactivateAlert = async (req, res) => {
  try {
    const alert = await ServiceAlert.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }
    res.status(200).json({ message: "Alert deactivated", alert });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { createAlert, getActiveAlerts, getAllAlerts, deactivateAlert };