const { getResponseForMessage, getQuickOptions } = require("../utils/intentMatcher");

const chatWithIntentBot = (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Please type a message" });
    }

    const { tag, reply } = getResponseForMessage(message);

    res.status(200).json({ reply, tag });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getOptions = (req, res) => {
  try {
    const options = getQuickOptions();
    res.status(200).json({ options });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { chatWithIntentBot, getOptions };