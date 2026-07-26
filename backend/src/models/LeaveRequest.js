const mongoose = require("mongoose");

const leaveRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["sick", "casual", "paid", "unpaid"], required: true },
    startDate: Date,
    endDate: Date,
    reason: String,
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // manager/HR/CEO
  },
  { timestamps: true }
);

leaveRequestSchema.index({ user: 1, status: 1 });
leaveRequestSchema.index({ status: 1 });

module.exports = mongoose.model("LeaveRequest", leaveRequestSchema);
