const Notification = require("../models/Notification");

// A simple reusable helper — call this from anywhere in the backend
// whenever something notification-worthy happens for a user.
async function notify(userId, type, title, message) {
  try {
    await Notification.create({ user: userId, type, title, message });
  } catch (error) {
    console.log("Failed to create notification:", error.message);
  }
}

module.exports = { notify };