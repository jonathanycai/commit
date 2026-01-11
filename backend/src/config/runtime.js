export const getAppEnv = () => {
    const explicit = process.env.APP_ENV;
    if (explicit === "local" || explicit === "preview" || explicit === "production") {
        return explicit;
    }

    if (process.env.NODE_ENV === "production") return "production";

    // Heuristic: when deployed on Render but not production.
    if (process.env.RENDER === "true" || process.env.RENDER_SERVICE_ID) return "preview";

    return "local";
};

export const isProduction = () => getAppEnv() === "production";
export const isPreview = () => getAppEnv() === "preview";
export const isLocal = () => getAppEnv() === "local";
