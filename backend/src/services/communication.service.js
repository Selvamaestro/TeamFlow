const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const conversationService = require("./conversation.service");

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.status = 404;
  }
}
class ForbiddenError extends Error {
  constructor(message) {
    super(message);
    this.status = 403;
  }
}
class BadRequestError extends Error {
  constructor(message) {
    super(message);
    this.status = 400;
  }
}

// self-heals: makes sure the caller is a participant of the global channel
// (covers users that existed before this feature was added)
async function listConversations(userId) {
  await conversationService.addUserToGlobalChannel(userId);

  return Conversation.find({ participants: userId }).sort({
    lastMessageAt: -1,
    createdAt: -1,
  });
}

// direct or ad-hoc group chats only; "global" and "project_group" are system-managed
async function createConversation(creatorId, { type, participantIds, projectId }) {
  if (type === "global") {
    throw new BadRequestError("The global channel is managed automatically and cannot be created manually");
  }

  const participants = new Set(participantIds.map(String));
  participants.add(creatorId);

  return Conversation.create({
    type,
    participants: Array.from(participants),
    project: projectId || null,
  });
}

async function assertParticipant(conversationId, userId) {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new NotFoundError("Conversation not found");

  const isParticipant = conversation.participants.some((p) => p.toString() === userId);
  if (!isParticipant) throw new ForbiddenError("Forbidden: not a participant");

  return conversation;
}

async function listMessages(conversationId, userId, { before, limit } = {}) {
  const conversation = await assertParticipant(conversationId, userId);

  const filter = { conversation: conversation._id };
  if (before) filter.createdAt = { $lt: new Date(before) };

  const messages = await Message.find(filter)
    .sort({ createdAt: -1 })
    .limit(Number(limit) || 50);

  return messages.reverse();
}

// persisted via REST, then broadcast in real time over Socket.IO
async function createMessage(io, conversationId, senderId, { content, attachmentUrl }) {
  const conversation = await assertParticipant(conversationId, senderId);

  if (!content && !attachmentUrl) {
    throw new BadRequestError("content or attachmentUrl is required");
  }

  const message = await Message.create({
    conversation: conversation._id,
    sender: senderId,
    content,
    attachmentUrl,
    readBy: [senderId],
  });

  conversation.lastMessageAt = new Date();
  await conversation.save();

  if (io) {
    io.to(`conversation:${conversation._id}`).emit("message:new", message);
  }

  return message;
}

module.exports = {
  listConversations,
  createConversation,
  listMessages,
  createMessage,
  NotFoundError,
  ForbiddenError,
  BadRequestError,
};
