const User = require("../models/User");
const Transaction = require("../models/Transaction");
const { notify } = require("../utils/notify");

const rechargeWallet = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Please enter a valid amount" });
    }
    const user = await User.findById(req.user.id);
    user.walletBalance += Number(amount);
    await user.save();

        const transaction = await Transaction.create({
      user: user._id,
      type: "recharge",
      amount: Number(amount),
      balanceAfter: user.walletBalance,
      description: `Wallet recharged with ₹${amount}`,
    });

    await notify(
      req.user.id,
      "wallet",
      "Wallet recharged",
      `₹${amount} added. New balance: ₹${user.walletBalance}.`
    );

    res.status(200).json({
      message: "Wallet recharged successfully",
      walletBalance: user.walletBalance,
      transaction,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getWalletBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ walletBalance: user.walletBalance });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { rechargeWallet, getWalletBalance, getTransactions };