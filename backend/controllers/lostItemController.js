const LostItem = require("../models/LostItem");

const reportLostItem = async (req, res) => {
  try {
    const { itemName, description, category, station, dateLost, contactPhone } = req.body;

    if (!itemName || !description || !station || !dateLost || !contactPhone) {
      return res.status(400).json({ message: "Please fill in all required fields" });
    }

    const lostItem = await LostItem.create({
      user: req.user.id,
      itemName,
      description,
      category: category || "Other",
      station,
      dateLost,
      contactPhone,
    });

    res.status(201).json({ message: "Lost item reported successfully", lostItem });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getMyLostItems = async (req, res) => {
  try {
    const items = await LostItem.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAllLostItems = async (req, res) => {
  try {
    const items = await LostItem.find({ status: { $ne: "returned" } })
      .select("itemName description category station dateLost status createdAt")
      .sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { reportLostItem, getMyLostItems, getAllLostItems };