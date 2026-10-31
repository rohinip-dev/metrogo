const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  source: { type: String, required: true },
  destination: { type: String, required: true },
  sourceLine: { type: String, required: true },
  destinationLine: { type: String, required: true },
  numberOfStops: { type: Number, required: true },
  distanceKm: { type: Number, required: true },
  estimatedTimeMinutes: { type: Number, required: true },
  fare: { type: Number, required: true },
  qrCode: { type: String, required: true },
  status: { type: String, enum: ["confirmed", "cancelled", "completed"], default: "confirmed" },
  paymentMethod: { type: String, enum: ["wallet", "upi", "card", "cash"], default: "wallet" },
  originalDestination: { type: String, default: null },
  wasCorrected: { type: Boolean, default: false },
}, { timestamps: true });

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;