const notificationService = require("../services/notification.service");

// GET /notifications  (self)
async function listNotifications(req, res, next) {
  try {
    const notifications = await notificationService.listNotifications(req.user.id, req.query);
    return res.status(200).json({ notifications });
  } catch (err) {
    next(err);
  }
}

// PATCH /notifications/:id/read  (self)
async function markRead(req, res, next) {
  try {
    const notification = await notificationService.markRead(req.params.id, req.user.id);
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    return res.status(200).json({ notification });
  } catch (err) {
    next(err);
  }
}

// PATCH /notifications/read-all  (self)
async function markAllRead(req, res, next) {
  try {
    await notificationService.markAllRead(req.user.id);
    return res.status(200).json({ message: "All notifications marked as read" });
  } catch (err) {
    next(err);
  }
}

module.exports = { listNotifications, markRead, markAllRead };
