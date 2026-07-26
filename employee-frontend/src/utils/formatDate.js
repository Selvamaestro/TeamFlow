export function formatTime(dateLike) {
  if (!dateLike) return "--:--";
  return new Date(dateLike).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function formatDate(dateLike) {
  if (!dateLike) return "";
  return new Date(dateLike).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

export function daysUntil(dateLike) {
  if (!dateLike) return null;
  const now = new Date();
  const target = new Date(dateLike);
  const diffMs = target.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0);
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function formatDueLabel(dateLike) {
  const days = daysUntil(dateLike);
  if (days === null) return "No due date";
  if (days < 0) return `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} overdue`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due in ${days} days`;
}
