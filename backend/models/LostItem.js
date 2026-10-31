const mongoose = require("mongoose");

const lostItemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  itemName: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ["Electronics", "Bag/Luggage", "Wallet/Purse", "Documents", "Clothing", "Other"],
    default: "Other",
  },
  station: { type: String, required: true },
  dateLost: { type: Date, required: true },
  contactPhone: { type: String, required: true },
  status: {
    type: String,
    enum: ["reported", "found", "returned"],
    default: "reported",
  },
}, { timestamps: true });

const LostItem = mongoose.model("LostItem", lostItemSchema);

module.exports = LostItem;