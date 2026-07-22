import { apiFetch } from "./apiClient";

export const attendanceService = {
    async getAttendance(params = {}) {
        return await apiFetch("/attendance");
    },
    async checkIn() {
        return await apiFetch("/attendance/check-in", { method: "POST" });
    },

    async checkOut() {
        return await apiFetch("/attendance/check-out", { method: "POST" });
    },


    async getLeaveRequests() {
        return await apiFetch("/leave");
    },


    async updateLeaveStatus(id, status, managerComment = "") {
        return await apiFetch(`/leave/${id}/status`, {
            method: "PATCH",
            body: { status, managerComment },
        });
    }
};

export default attendanceService;
