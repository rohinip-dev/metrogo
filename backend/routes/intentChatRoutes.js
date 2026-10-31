const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const { chatWithIntentBot, getOptions } = require("../controllers/intentChatController");

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { message: "Too many messages. Please wait a moment." },
});

router.post("/", chatLimiter, chatWithIntentBot);
router.get("/options", getOptions);

module.exports = router;