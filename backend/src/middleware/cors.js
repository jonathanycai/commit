const normalizeOrigin = (origin) => {
    if (!origin) return null;
    try {
        return new URL(origin).origin;
    } catch {
        return null;
    }
};

const parseExplicitAllowlist = () => {
    const raw = process.env.CORS_ALLOW_ORIGINS;
    if (!raw) return new Set();
    return new Set(
        raw
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
            .map((s) => {
                try {
                    return new URL(s).origin;
                } catch {
                    return null;
                }
            })
            .filter(Boolean)
    );
};

export const isAllowedOrigin = (origin) => {
    const normalized = normalizeOrigin(origin);
    if (!normalized) return false;

    const explicit = parseExplicitAllowlist();
    if (explicit.has(normalized)) return true;

    // Local dev
    if (
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(normalized) ||
        /^https:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(normalized)
    ) {
        return true;
    }

    const allowPreview = process.env.ALLOW_PREVIEW_ORIGINS === "true";
    if (allowPreview) {
        // Vercel preview URLs
        if (normalized.endsWith(".vercel.app")) return true;
        // Render preview URLs (and generally onrender-hosted frontends if any)
        if (normalized.endsWith(".onrender.com")) return true;
    }

    // Production frontend domain
    const prod = process.env.FRONTEND_ORIGIN;
    if (prod) {
        try {
            if (new URL(prod).origin === normalized) return true;
        } catch {
            // ignore
        }
    }

    return false;
};

export const corsOptions = {
    origin(origin, callback) {
        // Non-browser clients (curl/postman) won't send Origin; don't attach CORS headers.
        if (!origin) return callback(null, false);

        if (isAllowedOrigin(origin)) return callback(null, true);

        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
    optionsSuccessStatus: 204,
};
