import crypto from "crypto";
import { CSRF_COOKIE_NAME, getCsrfCookieOptions } from "../config/cookies.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export const issueCsrfCookie = (res) => {
    const token = crypto.randomBytes(32).toString("hex");
    res.cookie(CSRF_COOKIE_NAME, token, getCsrfCookieOptions({ maxAgeMs: 1000 * 60 * 60 * 24 * 7 }));
    return token;
};

export const csrfProtection = (req, res, next) => {
    if (process.env.CSRF_ENABLED === "false") return next();
    if (SAFE_METHODS.has(req.method)) return next();

    // Allow login/register before a CSRF token exists.
    if (req.path === "/auth/login" || req.path === "/auth/register" || req.path === "/auth/oauth/callback") {
        return next();
    }

    const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
    const headerToken = req.get("x-csrf-token");

    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
        return res.status(403).json({ error: "CSRF token invalid or missing" });
    }

    return next();
};
