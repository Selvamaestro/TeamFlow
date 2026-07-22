const Notification = require("../models/Notification");

/**
 * Creates a Notification and, if Socket.IO is initialized (app.get("io")),
 * pushes a `notification:new` event to the recipient's personal room.
 */
async function notify(app, { user, type, title, body, link }) {
  const notification = await Notification.create({ user, type, title, body, link });

  const io = app && app.get && app.get("io");
  if (io) {
    io.to(`user:${user}`).emit("notification:new", notification);
  }

  return notification;
}

module.exports = notify;
