import { apiFetch } from "./apiClient";

export const taskService = {

    async getProjectTasks(projectId, params = {}) {
        const query = new URLSearchParams();
        if (params.status) query.append("status", params.status);

        const queryString = query.toString() ? `?${query.toString()}` : "";
        return await apiFetch(`/projects/${projectId}/tasks${queryString}`);
    },
};

export default taskService;