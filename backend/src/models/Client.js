const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: String,
    company: String,
    phone: String,
    logoUrl: String,
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    notes: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Client", clientSchema);
