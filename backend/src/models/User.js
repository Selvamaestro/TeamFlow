const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    employeeId: { type: String, unique: true, sparse: true }, // e.g. "EMP-0231"
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    phone: String,
    avatarUrl: String,
    role: {
      type: String,
      enum: ["ceo", "manager", "hr", "team_leader", "employee"],
      required: true,
    },
    department: String,
    designation: String,
    employmentType: {
      type: String,
      enum: ["full_time", "contract", "intern"],
      default: "full_time",
    },
    joiningDate: Date,
    reportingManager: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    salary: { type: Number, select: false }, // visible to HR/CEO only, excluded by default
  },
  { timestamps: true }
);

userSchema.index({ department: 1, role: 1, status: 1 });
userSchema.index({ reportingManager: 1 });
userSchema.index({ name: "text", email: "text", employeeId: "text" });

module.exports = mongoose.model("User", userSchema);
