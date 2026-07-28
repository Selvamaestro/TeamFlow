const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    title: { type: String, required: true },
    description: String,
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // must be in project.members
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // teamLeader of project, or manager/ceo
    status: {
      type: String,
      enum: ["todo", "in_progress", "submitted", "approved", "rejected"],
      default: "todo",
    },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    dueDate: Date,
    submissionNote: String, // filled by employee when marking "submitted"
    attachments: [{ name: String, url: String }],
  },
  { timestamps: true }
);

taskSchema.index({ project: 1, assignedTo: 1 });
taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ assignedTo: 1, status: 1 });

module.exports = mongoose.model("Task", taskSchema);
