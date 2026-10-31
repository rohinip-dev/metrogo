const Station = require("../models/Station");

// Fare rules — these are just reasonable assumptions for a student project
const FARE_PER_STATION = 5; // ₹5 per station traveled
const MINIMUM_FARE = 10; // even a 1-stop journey costs at least ₹10
const AVG_DISTANCE_PER_STATION_KM = 1.2; // rough average gap between stations
const AVG_TIME_PER_STATION_MIN = 2.5; // rough average travel time between stations
const INTERCHANGE_PENALTY_MIN = 5; // extra minutes if changing lines

const searchRoute = async (req, res) => {
  try {
    const { source, destination } = req.query;

    if (!source || !destination) {
      return res.status(400).json({ message: "Please provide both source and destination" });
    }

    // Step 1: Find both stations (case-insensitive search)
    const sourceStation = await Station.findOne({ name: new RegExp(`^${source}$`, "i") });
    const destStation = await Station.findOne({ name: new RegExp(`^${destination}$`, "i") });

    if (!sourceStation || !destStation) {
      return res.status(404).json({ message: "One or both stations not found" });
    }

    if (sourceStation.name === destStation.name) {
      return res.status(400).json({ message: "Source and destination cannot be the same" });
    }

    // Step 2: Check if it's a same-line journey or needs an interchange
    const sameLine = sourceStation.line === destStation.line;
    let numStops;
    let interchangeNeeded = false;

    if (sameLine) {
      // Simple case: just count the difference in their "order" on the line
      numStops = Math.abs(sourceStation.order - destStation.order);
    } else {
      // Different lines: assume passenger travels to the interchange station,
      // then from the interchange station to the destination
      interchangeNeeded = true;
      const interchange = await Station.findOne({ isInterchange: true, line: sourceStation.line });
      const interchangeOnDestLine = await Station.findOne({ isInterchange: true, line: destStation.line });

      const legOne = Math.abs(sourceStation.order - (interchange ? interchange.order : 0));
      const legTwo = Math.abs((interchangeOnDestLine ? interchangeOnDestLine.order : 0) - destStation.order);
      numStops = legOne + legTwo;
    }

    // Step 3: Calculate fare, distance, and time based on number of stops
    const fare = Math.max(MINIMUM_FARE, numStops * FARE_PER_STATION);
    const distanceKm = (numStops * AVG_DISTANCE_PER_STATION_KM).toFixed(1);
    let estimatedMinutes = numStops * AVG_TIME_PER_STATION_MIN;
    if (interchangeNeeded) estimatedMinutes += INTERCHANGE_PENALTY_MIN;

    res.status(200).json({
      source: sourceStation.name,
      destination: destStation.name,
      sourceLine: sourceStation.line,
      destinationLine: destStation.line,
      interchangeRequired: interchangeNeeded,
      numberOfStops: numStops,
      distanceKm: Number(distanceKm),
      estimatedTimeMinutes: Math.round(estimatedMinutes),
      fare: fare,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { searchRoute };