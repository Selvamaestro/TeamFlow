// User API Service for interacting with backend /api/users endpoints

import { apiFetch } from "./apiClient";

export const userService = {
    // GET /api/users - List all users / employees
    async getUsers(params = {}) {
        const query = new URLSearchParams();
        if (params.role) query.append("role", params.role);
        if (params.department) query.append("department", params.department);
        if (params.search) query.append("search", params.search);

        const queryString = query.toString() ? `?${query.toString()}` : "";
        return await apiFetch(`/users${queryString}`);
    },

    // GET /api/users/:id - Get specific user
    async getUserById(id) {
        return await apiFetch(`/users/${id}`);
    }
};

export default userService;
