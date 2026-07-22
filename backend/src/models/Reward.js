const mongoose = require("mongoose");

const rewardSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: String, // e.g. "Employee of the Month"
  description: String,
  awardedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  points: Number,
  awardedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Reward", rewardSchema);
