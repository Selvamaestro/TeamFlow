const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // recipient
  type: {
    type: String,
    enum: ["task_assigned", "leave_status", "project_update", "reward", "general"],
  },
  title: String,
  body: String,
  link: String, // frontend route to deep-link to
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
