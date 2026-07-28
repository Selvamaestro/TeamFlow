import axiosClient from "./axiosClient";

// GET /api/users/:id -> { user }
export function getUser(id) {
  return axiosClient.get(`/users/${id}`).then((res) => res.data.user);
}

// PATCH /api/users/:id -> { user }
// Self can only edit: name, phone, avatarUrl (enforced server-side too).
export function updateUser(id, data) {
  return axiosClient.patch(`/users/${id}`, data).then((res) => res.data.user);
}

// POST /api/users/:id/avatar (multipart/form-data) -> { avatarUrl }
export function uploadAvatar(id, file) {
  const formData = new FormData();
  formData.append("avatar", file);
  return axiosClient
    .post(`/users/${id}/avatar`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data.avatarUrl);
}
