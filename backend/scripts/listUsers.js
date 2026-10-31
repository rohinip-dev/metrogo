const mongoose = require("mongoose");
const dns = require("dns");
require("dotenv").config();
const User = require("../models/User");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const listUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const users = await User.find({}, "name email role");
    console.log("📋 All registered users:");
    users.forEach((u) => {
      console.log(`  - ${u.name} | ${u.email} | role: ${u.role}`);
    });

    process.exit(0);
  } catch (error) {
    console.log("❌ Error:", error);
    process.exit(1);
  }
};

listUsers();