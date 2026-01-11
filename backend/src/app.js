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
import csrfRoutes from "./routes/csrf.js";
import { generalLimiter, rateLimitStatusRouter } from "./middleware/rateLimiter.js";

const app = express();

// Trust proxy for rate limiting (required for Render/Vercel)
app.set('trust proxy', 1);

// Security headers
app.use(helmet());

const allowedOrigins = new Set([
    "http://localhost:8080",
    "http://localhost:3000",
    "https://commit-jade.vercel.app",
]);

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);

            try {
                const url = new URL(origin);
                const hostname = url.hostname;

                if (allowedOrigins.has(origin)) return callback(null, true);
                if (hostname.endsWith(".vercel.app")) return callback(null, true);

                return callback(new Error("Not allowed by CORS"));
            } catch {
                return callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
    })
);

app.use(cookieParser());
app.use(express.json());

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

// CSRF token endpoint (double-submit cookie)
app.use(csrfRoutes);

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
