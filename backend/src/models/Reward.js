const mongoose = require("mongoose");

const rewardSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: String, // e.g. "Employee of the Month"
  description: String,
  // One of: task_completed, early_delivery, client_praise, helped_teammate,
  // late_delivery, client_complaint. Optional (manual "title only" rewards, e.g.
  // "Employee of the Month", won't have one) but when set it drives `points`.
  type: {
    type: String,
    enum: [
      "task_completed",
      "early_delivery",
      "client_praise",
      "helped_teammate",
      "late_delivery",
      "client_complaint",
      null,
    ],
    default: null,
  },
  task: { type: mongoose.Schema.Types.ObjectId, ref: "Task", default: null },
  awardedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  points: Number,
  awardedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Reward", rewardSchema);
