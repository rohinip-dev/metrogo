const Station = require("../models/Station");

const getAllStations = async (req, res) => {
  try {
    const stations = await Station.find().sort({ line: 1, order: 1 });
    res.status(200).json(stations);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getAllStations };