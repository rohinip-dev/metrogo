const mongoose = require("mongoose");

const emergencyAlertSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  userName: { type: String, required: true },
  userPhone: { type: String },
  message: { type: String, default: "SOS button pressed" },
  status: {
    type: String,
    enum: ["active", "resolved"],
    default: "active",
  },
}, { timestamps: true });

const EmergencyAlert = mongoose.model("EmergencyAlert", emergencyAlertSchema);

module.exports = EmergencyAlert;