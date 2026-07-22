// Project API Service for interacting with backend /api/projects endpoints

import { apiFetch } from "./apiClient";

export const projectService = {
    // GET /api/projects - List all projects
    async getProjects(params = {}) {
        const query = new URLSearchParams();
        if (params.status) query.append("status", params.status);
        if (params.search) query.append("search", params.search);

        const queryString = query.toString() ? `?${query.toString()}` : "";
        return await apiFetch(`/projects${queryString}`);
    },

    // GET /api/projects/:id - Get project by ID
    async getProjectById(id) {
        return await apiFetch(`/projects/${id}`);
    },

    // POST /api/projects - Create project in MongoDB
    async createProject(projectData) {
        return await apiFetch("/projects", {
            method: "POST",
            body: projectData,
        });
    },

    // PATCH /api/projects/:id - Update project in MongoDB
    async updateProject(id, projectData) {
        return await apiFetch(`/projects/${id}`, {
            method: "PATCH",
            body: projectData,
        });
    }
};

export default projectService;
