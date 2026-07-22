import axiosClient from "./axiosClient";

// GET /api/projects/:projectId/tasks -> { tasks: [...] }
// Backend force-filters to assignedTo: currentUser for plain employees.
export function listProjectTasks(projectId, params = {}) {
  return axiosClient
    .get(`/projects/${projectId}/tasks`, { params })
    .then((res) => res.data.tasks);
}

// GET /api/tasks/:id -> { task }
export function getTask(id) {
  return axiosClient.get(`/tasks/${id}`).then((res) => res.data.task);
}

// PATCH /api/tasks/:id/status -> { task }
// status: "todo" | "in_progress" | "submitted" | "approved" | "rejected"
export function updateTaskStatus(id, status, submissionNote) {
  return axiosClient
    .patch(`/tasks/${id}/status`, { status, submissionNote })
    .then((res) => res.data.task);
}

// PATCH /api/tasks/:id -> { task } (title/description/dueDate/priority edits)
export function updateTask(id, data) {
  return axiosClient.patch(`/tasks/${id}`, data).then((res) => res.data.task);
}
