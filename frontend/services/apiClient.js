const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function apiFetch(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    const defaultHeaders = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    if (typeof window !== "undefined") {
        const token = localStorage.getItem("token") || localStorage.getItem("teamflow_token");
        if (token) {
            defaultHeaders["Authorization"] = `Bearer ${token}`;
        }
    }

    const config = {
        ...options,
        headers: defaultHeaders,
    };

    if (options.credentials) {
        config.credentials = options.credentials;
    }

    if (config.body && typeof config.body === "object" && !(config.body instanceof FormData)) {
        config.body = JSON.stringify(config.body);
    }

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const error = new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
            error.status = response.status;
            error.data = errorData;
            throw error;
        }

        return await response.json();
    } catch (err) {
        console.warn(`[API Fetch Notice] ${endpoint}: ${err.message}`);
        throw err;
    }
}
