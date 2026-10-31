const Station = require("../models/Station");
const Booking = require("../models/Booking");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const QRCode = require("qrcode");
const { getSmartRecommendation } = require("../utils/smartRecommendation");
const { notify } = require("../utils/notify");

const FARE_PER_STATION = 5;
const MINIMUM_FARE = 10;
const AVG_DISTANCE_PER_STATION_KM = 1.2;
const AVG_TIME_PER_STATION_MIN = 2.5;
const INTERCHANGE_PENALTY_MIN = 5;

// ===== CREATE BOOKING =====
const createBooking = async (req, res) => {
  try {
    const { source, destination, paymentMethod } = req.body;
    const method = paymentMethod || "wallet";

    const sourceStation = await Station.findOne({ name: new RegExp(`^${source}$`, "i") });
    const destStation = await Station.findOne({ name: new RegExp(`^${destination}$`, "i") });

    if (!sourceStation || !destStation) {
      return res.status(404).json({ message: "One or both stations not found" });
    }

    const sameLine = sourceStation.line === destStation.line;
    let numStops;
    let interchangeNeeded = false;

    if (sameLine) {
      numStops = Math.abs(sourceStation.order - destStation.order);
    } else {
      interchangeNeeded = true;
      const interchange = await Station.findOne({ isInterchange: true, line: sourceStation.line });
      const interchangeOnDestLine = await Station.findOne({ isInterchange: true, line: destStation.line });
      const legOne = Math.abs(sourceStation.order - (interchange ? interchange.order : 0));
      const legTwo = Math.abs((interchangeOnDestLine ? interchangeOnDestLine.order : 0) - destStation.order);
      numStops = legOne + legTwo;
    }

    const fare = Math.max(MINIMUM_FARE, numStops * FARE_PER_STATION);
    const distanceKm = Number((numStops * AVG_DISTANCE_PER_STATION_KM).toFixed(1));
    let estimatedMinutes = numStops * AVG_TIME_PER_STATION_MIN;
    if (interchangeNeeded) estimatedMinutes += INTERCHANGE_PENALTY_MIN;

    const user = await User.findById(req.user.id);
    let walletBalanceAfter = user.walletBalance;

    if (method === "wallet") {
      if (user.walletBalance < fare) {
        return res.status(400).json({
          message: `Insufficient wallet balance. You have ₹${user.walletBalance}, but this ticket costs ₹${fare}. Please recharge your wallet or choose another payment method.`,
        });
      }
      user.walletBalance -= fare;
      await user.save();
      walletBalanceAfter = user.walletBalance;
    }

    const ticketRef = `MTG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const qrCodeDataUrl = await QRCode.toDataURL(ticketRef);
    const { recommendedCoach, crowdLevel } = getSmartRecommendation();

    const booking = await Booking.create({
      user: req.user.id,
      source: sourceStation.name,
      destination: destStation.name,
      sourceLine: sourceStation.line,
      destinationLine: destStation.line,
      numberOfStops: numStops,
      distanceKm,
      estimatedTimeMinutes: Math.round(estimatedMinutes),
      fare,
      qrCode: qrCodeDataUrl,
      paymentMethod: method,
      recommendedCoach,
      crowdLevel,
    });

        if (method === "wallet") {
      await Transaction.create({
        user: user._id,
        type: "fare_deduction",
        amount: fare,
        balanceAfter: user.walletBalance,
        description: `Fare for ${sourceStation.name} → ${destStation.name} (Wallet)`,
      });
    }

    await notify(
      req.user.id,
      "booking",
      "Ticket booked!",
      `${sourceStation.name} → ${destStation.name}, fare ₹${fare}.`
    );

    res.status(201).json({
      message: "Booking confirmed",
      booking,
      walletBalance: walletBalanceAfter,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== GET MY BOOKINGS =====
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== CANCEL BOOKING (with refund) =====
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only cancel your own tickets" });
    }
    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "This ticket is already cancelled" });
    }

    const user = await User.findById(req.user.id);
    let newBalance = user.walletBalance;

    if (booking.paymentMethod === "wallet") {
      user.walletBalance += booking.fare;
      await user.save();
      newBalance = user.walletBalance;

      await Transaction.create({
        user: user._id,
        type: "refund",
        amount: booking.fare,
        balanceAfter: user.walletBalance,
        description: `Refund for cancelled ticket: ${booking.source} → ${booking.destination}`,
      });
    }

    booking.status = "cancelled";
    await booking.save();

    res.status(200).json({
      message:
        booking.paymentMethod === "wallet"
          ? "Ticket cancelled and refund issued to wallet"
          : `Ticket cancelled. Refund for ${booking.paymentMethod.toUpperCase()} payments should be processed by the original payment provider.`,
      walletBalance: newBalance,
      booking,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== CORRECT MY JOURNEY (passenger exited at a different station) =====
const correctJourney = async (req, res) => {
  try {
    const { actualDestination } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only correct your own tickets" });
    }
    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "This ticket is already cancelled" });
    }
    if (booking.paymentMethod !== "wallet") {
      return res.status(400).json({
        message: "This ticket wasn't paid via Wallet, so fare correction can't be processed automatically. Please speak to a station attendant.",
      });
    }

    const sourceStation = await Station.findOne({ name: booking.source });
    const newDestStation = await Station.findOne({ name: new RegExp(`^${actualDestination}$`, "i") });

    if (!newDestStation) {
      return res.status(404).json({ message: "That station wasn't found" });
    }
    if (newDestStation.name === booking.source) {
      return res.status(400).json({ message: "You can't exit at the same station you boarded from" });
    }

    const sameLine = sourceStation.line === newDestStation.line;
    let numStops;
    let interchangeNeeded = false;

    if (sameLine) {
      numStops = Math.abs(sourceStation.order - newDestStation.order);
    } else {
      interchangeNeeded = true;
      const interchange = await Station.findOne({ isInterchange: true, line: sourceStation.line });
      const interchangeOnDestLine = await Station.findOne({ isInterchange: true, line: newDestStation.line });
      const legOne = Math.abs(sourceStation.order - (interchange ? interchange.order : 0));
      const legTwo = Math.abs((interchangeOnDestLine ? interchangeOnDestLine.order : 0) - newDestStation.order);
      numStops = legOne + legTwo;
    }

    const newFare = Math.max(MINIMUM_FARE, numStops * FARE_PER_STATION);
    const newDistanceKm = Number((numStops * AVG_DISTANCE_PER_STATION_KM).toFixed(1));
    let newEstimatedMinutes = numStops * AVG_TIME_PER_STATION_MIN;
    if (interchangeNeeded) newEstimatedMinutes += INTERCHANGE_PENALTY_MIN;

    const fareDifference = newFare - booking.fare;
    const user = await User.findById(req.user.id);

    if (fareDifference > 0) {
      if (user.walletBalance < fareDifference) {
        return res.status(400).json({
          message: `Your actual fare is ₹${newFare} (₹${fareDifference} more than what you paid). Your wallet balance is too low to cover this — please recharge first.`,
        });
      }
      user.walletBalance -= fareDifference;
      await Transaction.create({
        user: user._id,
        type: "fare_deduction",
        amount: fareDifference,
        balanceAfter: user.walletBalance,
        description: `Fare correction: ${booking.source} → ${newDestStation.name} (extra distance)`,
      });
    } else if (fareDifference < 0) {
      user.walletBalance += Math.abs(fareDifference);
      await Transaction.create({
        user: user._id,
        type: "refund",
        amount: Math.abs(fareDifference),
        balanceAfter: user.walletBalance,
        description: `Fare correction refund: ${booking.source} → ${newDestStation.name} (shorter journey)`,
      });
    }
    await user.save();

    if (!booking.wasCorrected) {
      booking.originalDestination = booking.destination;
    }

    booking.destination = newDestStation.name;
    booking.destinationLine = newDestStation.line;
    booking.numberOfStops = numStops;
    booking.distanceKm = newDistanceKm;
    booking.estimatedTimeMinutes = Math.round(newEstimatedMinutes);
    booking.fare = newFare;
    booking.wasCorrected = true;
    await booking.save();

    res.status(200).json({
      message:
        fareDifference > 0
          ? `Journey corrected. ₹${fareDifference} was deducted for the extra distance.`
          : fareDifference < 0
          ? `Journey corrected. ₹${Math.abs(fareDifference)} was refunded for the shorter distance.`
          : "Journey corrected. No fare change was needed.",
      walletBalance: user.walletBalance,
      booking,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { createBooking, getMyBookings, cancelBooking, correctJourney };