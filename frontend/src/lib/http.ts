import axios from "axios";
import { getAccessToken } from "@/lib/authToken";
import { getCsrfToken } from "@/lib/csrfToken";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const http = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

http.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
        config.headers = (config.headers ?? {}) as any;
        (config.headers as any).Authorization = `Bearer ${token}`;
    }

    const method = (config.method || "GET").toUpperCase();
    const isMutating = method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE";
    if (isMutating) {
        const csrfToken = getCsrfToken();
        if (csrfToken) {
            config.headers = (config.headers ?? {}) as any;
            (config.headers as any)["X-CSRF-Token"] = csrfToken;
        }
    }

    return config;
});
