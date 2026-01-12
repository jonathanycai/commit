export const csrfMiddleware = (req, res, next) => {
    const method = (req.method || "").toUpperCase();
    if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
        return next();
    }

    const cookieToken = req.cookies?.csrfToken;
    const headerToken = req.get("X-CSRF-Token");

    let reason = "mismatch";
    if (!cookieToken) reason = "missing_cookie";
    else if (!headerToken) reason = "missing_header";
    else if (cookieToken !== headerToken) reason = "mismatch";

    if (reason !== "mismatch" || cookieToken !== headerToken) {
        console.warn("CSRF verification failed", {
            method,
            path: req.originalUrl,
            origin: req.get("Origin"),
            reason,
        });
        return res.status(403).json({ message: "Invalid CSRF token" });
    }

    return next();
};

// Backwards-compatible export used by some routes.
export const verifyCsrf = csrfMiddleware;
