import axiosClient from "./axiosClient";

// POST /api/leave -> { leaveRequest }
// type: "sick" | "casual" | "paid" | "unpaid"
export function createLeaveRequest(data) {
  return axiosClient.post("/leave", data).then((res) => res.data.leaveRequest);
}

// GET /api/leave/me -> { requests: [...] }
export function getMyLeaveRequests() {
  return axiosClient.get("/leave/me").then((res) => res.data.requests);
}
