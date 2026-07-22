import { apiFetch } from "./apiClient";

export const clientService = {

    async getClients(params = {}) {
        const query = new URLSearchParams();
        if (params.status) query.append("status", params.status);
        if (params.search) query.append("search", params.search);

        const queryString = query.toString() ? `?${query.toString()}` : "";
        return await apiFetch(`/clients${queryString}`);
    },


    async getClientById(id) {
        return await apiFetch(`/clients/${id}`);
    },


    async createClient(clientData) {
        return await apiFetch("/clients", {
            method: "POST",
            body: clientData,
        });
    },


    async updateClient(id, clientData) {
        return await apiFetch(`/clients/${id}`, {
            method: "PATCH",
            body: clientData,
        });
    },


    async deleteClient(id) {
        return await apiFetch(`/clients/${id}`, {
            method: "DELETE",
        });
    }
};

export default clientService;
