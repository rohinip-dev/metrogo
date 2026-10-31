const mongoose = require("mongoose");

const favoriteRouteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId, // links this favorite to a specific person
    ref: "User",
    required: true,
  },
  source: { type: String, required: true },
  destination: { type: String, required: true },
  sourceLine: { type: String, required: true },
  destinationLine: { type: String, required: true },
}, { timestamps: true });

const FavoriteRoute = mongoose.model("FavoriteRoute", favoriteRouteSchema);

module.exports = FavoriteRoute;