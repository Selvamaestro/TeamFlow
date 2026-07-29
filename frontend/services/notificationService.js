import api from "@/lib/api";

export async function getNotifications() {
    const res = await api.get("/notifications");
    return res.data.notifications || [];
}

export async function markNotificationAsRead(id) {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data.notification;
}

export async function markAllNotificationsAsRead() {
    const res = await api.patch("/notifications/read-all");
    return res.data;
}
