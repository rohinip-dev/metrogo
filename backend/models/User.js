const mongoose = require("mongoose");

// This is the blueprint for what a "User" looks like in our database
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // name must be provided
  },
  email: {
    type: String,
    required: true,
    unique: true, // no two users can have the same email
  },
  password: {
    type: String,
    required: true, // this will store the ENCRYPTED password, never plain text
  },
  role: {
    type: String,
    enum: ["passenger", "admin"], // only these two values allowed
    default: "passenger",
  },
  walletBalance: {
    type: Number,
    default: 0, // every new user starts with 0 balance
  },
  otpCode: {
    type: String,
    default: null,
  },
  otpExpiry: {
    type: Date,
    default: null,
  },
}, { timestamps: true }); // this automatically adds "createdAt" and "updatedAt" fields

// This turns our blueprint into a usable Model, and connects it to a
// MongoDB collection called "users" (mongoose does the pluralizing automatically)
const User = mongoose.model("User", userSchema);

module.exports = User;