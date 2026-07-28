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

    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
    },

    status: {
      type: String,
      enum: [
        "planning",
        "in_progress",
        "on_hold",
        "completed",
        "cancelled",
        "archived",
      ],
      default: "planning",
    },

    startDate: Date,

    endDate: Date,

    dueDate: Date,

    budget: {
      type: Number,
      default: 0,
    },

    revenue: {
      type: Number,
      default: 0,
    },

    expenses: {
      type: Number,
      default: 0,
    },

    paidAmount: {
      type: Number,
      default: 0,
    },

    pendingAmount: {
      type: Number,
      default: 0,
    },

    paymentStatus: {
      type: String,
      enum: ["Paid", "Partial", "Pending"],
      default: "Pending",
    },

    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    teamLeader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    documents: [documentSubSchema],

    // 0-100, set by the project's Team Leader (or Manager/CEO for oversight).
    // Visible to everyone with project access: CEO, Manager, HR, Team Leader, members.
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  { timestamps: true }
);

projectSchema.index({ members: 1 });
projectSchema.index({ teamLeader: 1 });
projectSchema.index({ status: 1, client: 1 });

module.exports = mongoose.model("Project", projectSchema);
