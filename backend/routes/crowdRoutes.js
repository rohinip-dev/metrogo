const express = require("express");
const router = express.Router();
const { getCrowdPrediction } = require("../controllers/crowdController");

router.get("/", getCrowdPrediction);

module.exports = router;