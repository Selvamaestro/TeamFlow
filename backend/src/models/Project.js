const mongoose = require("mongoose");

const documentSubSchema = new mongoose.Schema(
  {
    name: String,
    url: String,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    client: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
    status: {
      type: String,
      enum: ["planning", "in_progress", "on_hold", "completed", "cancelled"],
      default: "planning",
    },
    dueDate: Date,
    startDate: Date,
    endDate: Date,
    budget: { type: Number, default: 0 }, // Planned project value
    revenue: { type: Number, default: 0 }, // Actual revenue received
    expenses: { type: Number, default: 0 }, // Total project expenses
    paidAmount: { type: Number, default: 0 }, // Amount received from client
    pendingAmount: { type: Number, default: 0 }, // Remaining amount
    paymentStatus: {
      type: String,
      enum: ["Paid", "Partial", "Pending"],
      default: "Pending",
    },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // creator/owner
    teamLeader: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    documents: [documentSubSchema],
  },
  { timestamps: true }
);

projectSchema.index({ members: 1 });
projectSchema.index({ teamLeader: 1 });
projectSchema.index({ status: 1, client: 1 });

module.exports = mongoose.model("Project", projectSchema);
