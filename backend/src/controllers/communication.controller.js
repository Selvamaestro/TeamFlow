const communicationService = require("../services/communication.service");

function handleServiceError(err, res, next) {
  if (
    err instanceof communicationService.NotFoundError ||
    err instanceof communicationService.ForbiddenError ||
    err instanceof communicationService.BadRequestError
  ) {
    return res.status(err.status).json({ message: err.message });
  }
  next(err);
}

// GET /conversations  (participant)
async function listConversations(req, res, next) {
  try {
    const conversations = await communicationService.listConversations(req.user.id);
    return res.status(200).json({ conversations });
  } catch (err) {
    next(err);
  }
}

// POST /conversations  (any)
async function createConversation(req, res, next) {
  try {
    const { type, participantIds } = req.body;
    if (!type || !Array.isArray(participantIds)) {
      return res.status(400).json({ message: "type and participantIds are required" });
    }

    const conversation = await communicationService.createConversation(req.user.id, req.body);
    return res.status(201).json({ conversation });
  } catch (err) {
    handleServiceError(err, res, next);
  }
}

// GET /conversations/:id/messages  (participant)
async function listMessages(req, res, next) {
  try {
    const messages = await communicationService.listMessages(req.params.id, req.user.id, req.query);
    return res.status(200).json({ messages });
  } catch (err) {
    handleServiceError(err, res, next);
  }
}

// POST /conversations/:id/messages  (participant)
async function createMessage(req, res, next) {
  try {
    const io = req.app.get("io");
    const message = await communicationService.createMessage(io, req.params.id, req.user.id, req.body);
    return res.status(201).json({ message });
  } catch (err) {
    handleServiceError(err, res, next);
  }
}

module.exports = { listConversations, createConversation, listMessages, createMessage };
