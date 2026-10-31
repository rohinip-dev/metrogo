const mongoose = require("mongoose");

const serviceAlertSchema = new mongoose.Schema({
  message: { type: String, required: true },
  line: {
    type: String,
    enum: ["Purple Line", "Green Line", "Both Lines", "General"],
    default: "General",
  },
  severity: {
    type: String,
    enum: ["info", "warning", "critical"],
    default: "info",
  },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

const ServiceAlert = mongoose.model("ServiceAlert", serviceAlertSchema);

module.exports = ServiceAlert;