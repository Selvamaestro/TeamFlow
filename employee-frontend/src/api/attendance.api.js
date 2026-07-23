import axiosClient from "./axiosClient";

// POST /api/attendance/check-in -> { attendance } (409 if already checked in today)
export function checkIn() {
  return axiosClient.post("/attendance/check-in").then((res) => res.data.attendance);
}

// POST /api/attendance/check-out -> { attendance }
export function checkOut() {
  return axiosClient.post("/attendance/check-out").then((res) => res.data.attendance);
}

// GET /api/attendance/me?month&year -> { records: [...] } sorted desc by date
export function getMyAttendance(params = {}) {
  return axiosClient.get("/attendance/me", { params }).then((res) => res.data.records);
}
