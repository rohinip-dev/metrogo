const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const {
  loginUser,
  requestSignupOtp,
  verifySignupOtp,
  requestPasswordResetOtp,
  resetPassword,
} = require("../controllers/authController");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many attempts. Please try again in 15 minutes." },
});

router.post("/login", authLimiter, loginUser);
router.post("/signup/request-otp", authLimiter, requestSignupOtp);
router.post("/signup/verify-otp", authLimiter, verifySignupOtp);
router.post("/forgot-password/request-otp", authLimiter, requestPasswordResetOtp);
router.post("/forgot-password/reset", authLimiter, resetPassword);

module.exports = router;