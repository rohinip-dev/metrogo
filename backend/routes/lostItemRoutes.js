const express = require("express");
const router = express.Router();
const { reportLostItem, getMyLostItems, getAllLostItems } = require("../controllers/lostItemController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, reportLostItem);
router.get("/my-reports", protect, getMyLostItems);
router.get("/", getAllLostItems);

module.exports = router;