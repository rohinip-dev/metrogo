const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { rechargeWallet, getWalletBalance, getTransactions } = require("../controllers/walletController");

router.post("/recharge", protect, rechargeWallet);
router.get("/balance", protect, getWalletBalance);
router.get("/transactions", protect, getTransactions);

module.exports = router;