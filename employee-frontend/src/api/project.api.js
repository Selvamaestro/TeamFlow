import axiosClient from "./axiosClient";

// GET /api/projects -> { projects: [...] }
// Backend auto-scopes: employees only see projects where they're a member or team leader.
export function listProjects(params = {}) {
  return axiosClient.get("/projects", { params }).then((res) => res.data.projects);
}

// GET /api/projects/:id -> { project }
export function getProject(id) {
  return axiosClient.get(`/projects/${id}`).then((res) => res.data.project);
}

// PATCH /api/projects/:id -> { project }
export function updateProject(id, data) {
  return axiosClient.patch(`/projects/${id}`, data).then((res) => res.data.project);
}
