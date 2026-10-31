const mongoose = require("mongoose");

const stationSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true },
  line: { type: String, required: true },
  order: { type: Number, required: true },
  isInterchange: { type: Boolean, default: false },
}, { timestamps: true });

const Station = mongoose.model("Station", stationSchema);

module.exports = Station;