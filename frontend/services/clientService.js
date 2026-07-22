// Client API Service for interacting with backend /api/clients endpoints

import { apiFetch } from "./apiClient";

export const clientService = {
    // GET /api/clients - List all clients
    async getClients(params = {}) {
        const query = new URLSearchParams();
        if (params.status) query.append("status", params.status);
        if (params.search) query.append("search", params.search);

        const queryString = query.toString() ? `?${query.toString()}` : "";
        return await apiFetch(`/clients${queryString}`);
    },

    // GET /api/clients/:id - Get a specific client
    async getClientById(id) {
        return await apiFetch(`/clients/${id}`);
    },

    // POST /api/clients - Create a new client in MongoDB
    async createClient(clientData) {
        return await apiFetch("/clients", {
            method: "POST",
            body: clientData,
        });
    },

    // PATCH /api/clients/:id - Update client in MongoDB
    async updateClient(id, clientData) {
        return await apiFetch(`/clients/${id}`, {
            method: "PATCH",
            body: clientData,
        });
    },

    // DELETE /api/clients/:id - Delete client in MongoDB
    async deleteClient(id) {
        return await apiFetch(`/clients/${id}`, {
            method: "DELETE",
        });
    }
};

export default clientService;
