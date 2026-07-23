"use client";

import { useState } from "react";

const PRIORITY_STYLES = {
  high: "bg-error-container text-on-error-container",
  medium: "bg-secondary-container text-on-secondary-container",
  low: "bg-secondary-container text-on-secondary-container",
};

const DONE_STATUSES = ["submitted", "approved"];

export default function TaskListItem({ task, onToggle }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const isDone = DONE_STATUSES.includes(task.status);

  async function handleChange(e) {
    setIsUpdating(true);
    try {
      await onToggle(task, e.target.checked ? "submitted" : "todo");
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="flex items-center justify-between p-3 hover:bg-surface-container-low rounded-lg transition-all">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary disabled:opacity-50"
          checked={isDone}
          disabled={isUpdating || task.status === "approved" || task.status === "rejected"}
          onChange={handleChange}
        />
        <span className={`font-label-md text-on-surface ${isDone ? "line-through opacity-50" : ""}`}>
          {task.title}
        </span>
      </div>
      {task.status === "approved" ? (
        <span className="text-label-sm text-on-surface-variant">Approved</span>
      ) : task.status === "rejected" ? (
        <span className="px-2 py-1 bg-error-container text-on-error-container text-label-sm rounded font-semibold">
          Rejected
        </span>
      ) : (
        <span
          className={`px-2 py-1 text-label-sm rounded font-semibold ${
            PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium
          }`}
        >
          {task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1)}
        </span>
      )}
    </div>
  );
}
