// Chat API service for the admin panel (CEO / Manager / HR).
// Mirrors employee-frontend/src/api/chat.api.js so both apps talk to the same
// /conversations REST endpoints and Socket.IO events.
import api from "@/lib/api";

export const chatService = {
  // GET /conversations -> global + project_group + direct, sorted by lastMessageAt desc
  async listConversations() {
    const res = await api.get("/conversations");
    return res.data.conversations;
  },

  // POST /conversations -> direct or ad-hoc group chat only
  async createConversation(data) {
    const res = await api.post("/conversations", data);
    return res.data.conversation;
  },

  // GET /conversations/:id/messages -> oldest first
  async listMessages(conversationId, params = {}) {
    const res = await api.get(`/conversations/${conversationId}/messages`, { params });
    return res.data.messages;
  },

  // POST /conversations/:id/messages -> also broadcast over Socket.IO by the backend
  async sendMessage(conversationId, data) {
    const res = await api.post(`/conversations/${conversationId}/messages`, data);
    return res.data.message;
  },

  // POST /conversations/upload-attachment (multipart) -> Cloudinary-hosted file
  async uploadAttachment(file) {
    const formData = new FormData();
    formData.append("attachment", file);
    const res = await api.post("/conversations/upload-attachment", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
};

export default chatService;
