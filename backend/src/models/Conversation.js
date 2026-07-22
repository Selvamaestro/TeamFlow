const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["direct", "project_group", "global"], required: true },
    name: String, // for project_group: same as project title
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", default: null },
    lastMessageAt: Date,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

conversationSchema.index({ participants: 1 });
conversationSchema.index({ project: 1, type: 1 });
// Only one "global" (company-wide) conversation should ever exist.
conversationSchema.index(
  { type: 1 },
  { unique: true, partialFilterExpression: { type: "global" } }
);

module.exports = mongoose.model("Conversation", conversationSchema);
