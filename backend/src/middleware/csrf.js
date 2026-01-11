export const verifyCsrf = (req, res, next) => {
    const cookieToken = req.cookies?.csrfToken;
    const headerToken = req.get("x-csrf-token");

    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
        return res.status(403).json({ error: "Invalid CSRF token" });
    }

    next();
};
