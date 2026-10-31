const FavoriteRoute = require("../models/FavoriteRoute");

// ===== SAVE A NEW FAVORITE =====
const addFavorite = async (req, res) => {
  try {
    const { source, destination, sourceLine, destinationLine } = req.body;

    // Don't save the same route twice for the same person
    const existing = await FavoriteRoute.findOne({
      user: req.user.id,
      source,
      destination,
    });
    if (existing) {
      return res.status(400).json({ message: "This route is already in your favorites" });
    }

    const favorite = await FavoriteRoute.create({
      user: req.user.id,
      source,
      destination,
      sourceLine,
      destinationLine,
    });

    res.status(201).json({ message: "Saved to favorites", favorite });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== GET ALL MY FAVORITES =====
const getFavorites = async (req, res) => {
  try {
    const favorites = await FavoriteRoute.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(favorites);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== DELETE A FAVORITE =====
const deleteFavorite = async (req, res) => {
  try {
    const favorite = await FavoriteRoute.findById(req.params.id);
    if (!favorite) {
      return res.status(404).json({ message: "Favorite not found" });
    }
    if (favorite.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only delete your own favorites" });
    }
    await favorite.deleteOne();
    res.status(200).json({ message: "Favorite removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { addFavorite, getFavorites, deleteFavorite };