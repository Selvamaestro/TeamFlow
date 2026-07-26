import axiosClient from "./axiosClient";

// GET /api/conversations -> { conversations: [...] }
// Each conversation has participants populated with { _id, name, avatarUrl, role }.
export function listConversations() {
  return axiosClient.get("/conversations").then((res) => res.data.conversations);
}

// POST /api/conversations -> { conversation }
// type: "direct" | "project_group" ("global" is system-managed and can't be created here)
export function createConversation(data) {
  return axiosClient.post("/conversations", data).then((res) => res.data.conversation);
}

// GET /api/conversations/:id/messages?before&limit -> { messages: [...] }
// Each message has sender populated with { _id, name, avatarUrl }.
export function listMessages(conversationId, params = {}) {
  return axiosClient
    .get(`/conversations/${conversationId}/messages`, { params })
    .then((res) => res.data.messages);
}

// POST /api/conversations/:id/messages -> { message }
export function sendMessage(conversationId, data) {
  return axiosClient
    .post(`/conversations/${conversationId}/messages`, data)
    .then((res) => res.data.message);
}
