import { isLocal } from "./runtime.js";

export const AUTH_COOKIE_NAME = "auth";
export const REFRESH_COOKIE_NAME = "refresh";
export const CSRF_COOKIE_NAME = "csrf";

export const getCookiePolicy = () => {
    // Local dev should use same-origin proxy (Vite) so we can keep cookies working over HTTP.
    // Preview/production are HTTPS cross-origin, so SameSite=None + Secure is required.
    if (isLocal()) {
        return { sameSite: "lax", secure: false };
    }

    return { sameSite: "none", secure: true };
};

export const getAuthCookieOptions = ({ maxAgeMs } = {}) => {
    const { sameSite, secure } = getCookiePolicy();
    return {
        httpOnly: true,
        secure,
        sameSite,
        path: "/",
        ...(typeof maxAgeMs === "number" ? { maxAge: maxAgeMs } : {}),
    };
};

export const getCsrfCookieOptions = ({ maxAgeMs } = {}) => {
    const { sameSite, secure } = getCookiePolicy();
    return {
        httpOnly: false,
        secure,
        sameSite,
        path: "/",
        ...(typeof maxAgeMs === "number" ? { maxAge: maxAgeMs } : {}),
    };
};
