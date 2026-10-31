const mongoose = require("mongoose");
const dns = require("dns");
require("dotenv").config();
const User = require("../models/User");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

// ⚠️ Change this to the email you actually log in with!
const EMAIL_TO_PROMOTE = "icelattee10@gmail.com";

const makeAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const user = await User.findOneAndUpdate(
      { email: EMAIL_TO_PROMOTE },
      { role: "admin" },
      { new: true }
    );

    if (!user) {
      console.log("❌ No user found with that email");
    } else {
      console.log(`✅ ${user.name} (${user.email}) is now an admin!`);
    }

    process.exit(0);
  } catch (error) {
    console.log("❌ Error:", error);
    process.exit(1);
  }
};

makeAdmin();