// This runs AFTER authMiddleware's "protect" — it checks the logged-in
// user's role is specifically "admin", not just any logged-in passenger
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
};

module.exports = { adminOnly };