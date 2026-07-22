// Attendance API Service for interacting with backend /api/attendance and /api/leave endpoints

import { apiFetch } from "./apiClient";

export const attendanceService = {
    // GET /api/attendance - List attendance records
    async getAttendance(params = {}) {
        return await apiFetch("/attendance");
    },

    // POST /api/attendance/check-in - Employee check-in
    async checkIn() {
        return await apiFetch("/attendance/check-in", { method: "POST" });
    },

    // POST /api/attendance/check-out - Employee check-out
    async checkOut() {
        return await apiFetch("/attendance/check-out", { method: "POST" });
    },

    // GET /api/leave - List leave requests
    async getLeaveRequests() {
        return await apiFetch("/leave");
    },

    // PATCH /api/leave/:id/status - Approve or reject leave request
    async updateLeaveStatus(id, status, managerComment = "") {
        return await apiFetch(`/leave/${id}/status`, {
            method: "PATCH",
            body: { status, managerComment },
        });
    }
};

export default attendanceService;
