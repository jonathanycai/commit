import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import healthRoutes from "./routes/health.js";
import applicationRoutes from "./routes/applications.js";
import projectRoutes from "./routes/projects.js";
import notificationRoutes from "./routes/notifications.js";
import swipesRoutes from "./swipes/routes.js";
import { generalLimiter, rateLimitStatusRouter } from "./middleware/rateLimiter.js";

const app = express();

// Trust proxy for rate limiting (required for Render/Vercel)
app.set('trust proxy', 1);

// Security headers
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const isAllowedOrigin = (origin) => {
    if (!origin) return true;

    // Local dev
    if (origin === "http://localhost:8080" || origin === "http://localhost:5173") {
        return true;
    }

    try {
        const { hostname } = new URL(origin);
        // Vercel preview + production domains
        if (hostname === "commit-jade.vercel.app" || hostname.endsWith(".vercel.app")) {
            return true;
        }
    } catch {
        // Non-URL origin string
    }

    return false;
};

const corsOptions = {
    origin: function (origin, callback) {
        const allowed = isAllowedOrigin(origin);
        if (!allowed) {
            console.log('Blocked by CORS:', origin);
        }
        // IMPORTANT: do not pass an Error here; it causes Express to reply without CORS headers,
        // which surfaces as “No Access-Control-Allow-Origin header” in the browser.
        callback(null, allowed);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
// Ensure preflight requests always receive CORS headers
app.options(/.*/, cors(corsOptions));
app.use(express.json());
app.use(cookieParser()); // Parse cookies for httpOnly token storage

// Apply general rate limiting to all routes
app.use(generalLimiter);

// ===========================
// ROUTE IMPORTS
// ===========================

// Rate limit status routes
app.use("/rate-limit", rateLimitStatusRouter);

app.get("/", (req, res) => {
    res.redirect("/health");
});

// Health check routes
app.use("/health", healthRoutes);

// Authentication routes
app.use("/auth", authRoutes);

// User profile routes
app.use("/users", userRoutes);

// Projects routes
app.use("/projects", projectRoutes);

// Applications/Requests routes
app.use("/applications", applicationRoutes);

// Notifications routes
app.use("/notifications", notificationRoutes);

// Swipes functionality
app.use("/swipes", swipesRoutes);

// Start the server
app.listen(process.env.PORT || 4000, () =>
    console.log(`running on http://localhost:${process.env.PORT || 4000}`)
);
