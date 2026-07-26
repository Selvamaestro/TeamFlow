import axiosClient from "./axiosClient";

// GET /api/conversations -> { conversations: [...] } (global + project_group + direct, sorted by lastMessageAt desc)
export function listConversations() {
  return axiosClient.get("/conversations").then((res) => res.data.conversations);
}

// POST /api/conversations -> { conversation }  (direct or ad-hoc group only; "global"/"project_group" are system-managed)
export function createConversation(data) {
  return axiosClient.post("/conversations", data).then((res) => res.data.conversation);
}

// GET /api/conversations/:id/messages?before&limit -> { messages: [...] } (oldest first)
export function listMessages(conversationId, params = {}) {
  return axiosClient
    .get(`/conversations/${conversationId}/messages`, { params })
    .then((res) => res.data.messages);
}

// POST /api/conversations/:id/messages -> { message } (also broadcast over Socket.IO by the backend)
export function sendMessage(conversationId, data) {
  return axiosClient
    .post(`/conversations/${conversationId}/messages`, data)
    .then((res) => res.data.message);
}

// POST /api/conversations/upload-attachment (multipart) -> { attachmentUrl, attachmentName, attachmentType }
// Upload the file first, then pass the returned fields into sendMessage().
export function uploadAttachment(file) {
  const formData = new FormData();
  formData.append("attachment", file);
  return axiosClient
    .post("/conversations/upload-attachment", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data);
}