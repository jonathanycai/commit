import axios from "axios";
import { getAccessToken } from "@/lib/authToken";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const http = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

const getCookie = (name: string) => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/[$()*+.?[\\\]^{|}-]/g, "\\$&")}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
};

http.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }

    const csrfToken = getCookie("csrfToken");
    if (csrfToken) {
        config.headers = config.headers || {};
        config.headers["X-CSRF-Token"] = csrfToken;
    }

    return config;
});
