const express = require("express");
const router = express.Router();
const { getAllStations } = require("../controllers/stationController");
const { searchRoute } = require("../controllers/routeController");

router.get("/", getAllStations);
router.get("/route-search", searchRoute);

module.exports = router;