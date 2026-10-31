const { predictCrowd } = require("../utils/crowdPrediction");

const getCrowdPrediction = (req, res) => {
  try {
    const prediction = predictCrowd();
    res.status(200).json(prediction);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getCrowdPrediction };