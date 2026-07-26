import axiosClient from "./axiosClient";

// POST /api/auth/login -> { token, user: { id, name, role, avatarUrl } }
export function login(email, password) {
  return axiosClient.post("/auth/login", { email, password }).then((res) => res.data);
}

// POST /api/auth/logout -> { message }
export function logout() {
  return axiosClient.post("/auth/logout").then((res) => res.data);
}

// GET /api/auth/me -> { user } (full sanitized user document)
export function fetchMe() {
  return axiosClient.get("/auth/me").then((res) => res.data.user);
}
