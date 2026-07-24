const mongoose = require("mongoose");

const agendaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    date: {
      type: Date,
      required: true,
    },

    time: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["Meeting", "Task", "Reminder"],
      default: "Meeting",
    },

    completed: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

agendaSchema.index({ createdBy: 1, date: 1 });

module.exports = mongoose.model("Agenda", agendaSchema);