const { Server } = require("socket.io");
const { verifyToken } = require("../utils/jwt");
const Conversation = require("../models/Conversation");

function initSocket(server, corsOrigins) {
  const io = new Server(server, {
    cors: { origin: corsOrigins, credentials: true },
  });

  
  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(" ")[1];

      if (!token) return next(new Error("Not authenticated"));

      const decoded = verifyToken(token);
      socket.user = { id: decoded.userId, role: decoded.role };
      next();
    } catch (err) {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", async (socket) => {
    const userId = socket.user.id;

    // personal room for direct notifications
    socket.join(`user:${userId}`);

    // join a room per conversation the user is part of
    const conversations = await Conversation.find({ participants: userId }).select("_id");
    conversations.forEach((c) => socket.join(`conversation:${c._id}`));

    socket.on("typing:start", ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit("typing:start", { userId, conversationId });
    });

    socket.on("typing:stop", ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit("typing:stop", { userId, conversationId });
    });

    socket.on("message:read", async ({ conversationId, messageId }) => {
      socket.to(`conversation:${conversationId}`).emit("message:read", { userId, messageId, conversationId });
    });

    socket.on("conversation:join", ({ conversationId }) => {
      socket.join(`conversation:${conversationId}`);
    });
  });

  return io;
}

module.exports = initSocket;
