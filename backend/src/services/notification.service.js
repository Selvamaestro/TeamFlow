const Notification = require("../models/Notification");

async function listNotifications(userId, { unread } = {}) {
  const filter = { user: userId };
  if (unread === "true") filter.read = false;
  return Notification.find(filter).sort({ createdAt: -1 });
}

async function markRead(id, userId) {
  return Notification.findOneAndUpdate({ _id: id, user: userId }, { read: true }, { new: true });
}

async function markAllRead(userId) {
  return Notification.updateMany({ user: userId, read: false }, { read: true });
}

module.exports = { listNotifications, markRead, markAllRead };
