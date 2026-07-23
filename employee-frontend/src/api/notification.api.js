import axiosClient from "./axiosClient";

// GET /api/notifications?unread=true -> { notifications: [...] }
export function listNotifications(params = {}) {
  return axiosClient.get("/notifications", { params }).then((res) => res.data.notifications);
}

// PATCH /api/notifications/:id/read -> { notification }
export function markNotificationRead(id) {
  return axiosClient.patch(`/notifications/${id}/read`).then((res) => res.data.notification);
}

// PATCH /api/notifications/read-all -> { message }
export function markAllNotificationsRead() {
  return axiosClient.patch("/notifications/read-all").then((res) => res.data);
}
