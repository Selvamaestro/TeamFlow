import api from "@/lib/api";

// Get all notifications
export const getNotifications = async (unread = false) => {
  const response = await api.get(
    `/notifications${unread ? "?unread=true" : ""}`
  );
  return response.data.notifications;
};

// Mark one notification as read
export const markNotificationAsRead = async (id) => {
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data.notification;
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  const response = await api.patch("/notifications/read-all");
  return response.data;
};