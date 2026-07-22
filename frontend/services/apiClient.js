// Base API Client service for HTTP requests to the backend API

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const DEFAULT_CEO_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YTVmMzYwOTI1ZWExNzkwMjFiOTRlNTEiLCJyb2xlIjoiY2VvIiwiaWF0IjoxNzg0NzE3NzQzLCJleHAiOjE3ODUzMjI1NDN9.36rj7EulhbCPFrp7-E7q9anf9_D7gqZ2LVTk8RwitNA";

export async function apiFetch(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    const defaultHeaders = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    // Get auth token from localStorage if present or use default CEO token
    if (typeof window !== "undefined") {
        let token = localStorage.getItem("teamflow_token");
        if (!token) {
            token = DEFAULT_CEO_TOKEN;
            localStorage.setItem("teamflow_token", token);
        }
        defaultHeaders["Authorization"] = `Bearer ${token}`;
    } else {
        defaultHeaders["Authorization"] = `Bearer ${DEFAULT_CEO_TOKEN}`;
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
