const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ===== SIGNUP STEP 1: validate + send OTP (does NOT create account yet) =====
const requestSignupOtp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    const allowedDomains = [
      "gmail.com", "yahoo.com", "outlook.com", "hotmail.com",
      "icloud.com", "protonmail.com", "live.com", "rediffmail.com",
    ];
    const domain = email.split("@")[1]?.toLowerCase();
    if (!allowedDomains.includes(domain)) {
      return res.status(400).json({
        message: "Please use a valid email provider (Gmail, Yahoo, Outlook, etc.)",
      });
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters and include at least one letter and one number",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const signupToken = jwt.sign(
      { name, email, password, otp },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    console.log(`🔐 Signup OTP for ${email}: ${otp}`);

    res.status(200).json({
      message: "OTP sent to your email. Please verify to complete signup.",
      signupToken,
      devOtp: otp,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== SIGNUP STEP 2: verify OTP, actually create the account =====
const verifySignupOtp = async (req, res) => {
  try {
    const { signupToken, otp } = req.body;

    let decoded;
    try {
      decoded = jwt.verify(signupToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: "Signup session expired. Please sign up again." });
    }

    if (decoded.otp !== otp) {
      return res.status(400).json({ message: "Incorrect OTP" });
    }

    const existingUser = await User.findOne({ email: decoded.email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(decoded.password, salt);

    const newUser = await User.create({
      name: decoded.name,
      email: decoded.email,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Account created successfully",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        walletBalance: newUser.walletBalance,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== LOGIN (simple, no OTP) =====
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        walletBalance: user.walletBalance,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== FORGOT PASSWORD STEP 1: send OTP =====
const requestPasswordResetOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ message: "If that email exists, an OTP has been sent." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otpCode = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    console.log(`🔐 Password reset OTP for ${email}: ${otp}`);

    res.status(200).json({
      message: "If that email exists, an OTP has been sent.",
      userId: user._id,
      devOtp: otp,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== FORGOT PASSWORD STEP 2: verify OTP + set new password =====
const resetPassword = async (req, res) => {
  try {
    const { userId, otp, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.otpCode || !user.otpExpiry || new Date() > user.otpExpiry) {
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    if (user.otpCode !== otp) {
      return res.status(400).json({ message: "Incorrect OTP" });
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters and include at least one letter and one number",
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.otpCode = null;
    user.otpExpiry = null;
    await user.save();

    res.status(200).json({ message: "Password reset successfully. Please log in." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  loginUser,
  requestSignupOtp,
  verifySignupOtp,
  requestPasswordResetOtp,
  resetPassword,
};