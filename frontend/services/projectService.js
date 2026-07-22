import { apiFetch } from "./apiClient";

export const projectService = {

    async getProjects(params = {}) {
        const query = new URLSearchParams();
        if (params.status) query.append("status", params.status);
        if (params.search) query.append("search", params.search);

        const queryString = query.toString() ? `?${query.toString()}` : "";
        return await apiFetch(`/projects${queryString}`);
    },


    async getProjectById(id) {
        return await apiFetch(`/projects/${id}`);
    },


    async createProject(projectData) {
        return await apiFetch("/projects", {
            method: "POST",
            body: projectData,
        });
    },


    async updateProject(id, projectData) {
        return await apiFetch(`/projects/${id}`, {
            method: "PATCH",
            body: projectData,
        });
    }
};

export default projectService;
