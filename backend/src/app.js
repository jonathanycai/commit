import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import healthRoutes from "./routes/health.js";
import applicationRoutes from "./routes/applications.js";
import projectRoutes from "./routes/projects.js";
import notificationRoutes from "./routes/notifications.js";
import swipesRoutes from "./swipes/routes.js";
import { generalLimiter, rateLimitStatusRouter } from "./middleware/rateLimiter.js";

const app = express();
app.use(cors());
app.use(express.json());

// Apply general rate limiting to all routes
app.use(generalLimiter);

// ===========================
// ROUTE IMPORTS
// ===========================

// Rate limit status routes
app.use("/rate-limit", rateLimitStatusRouter);

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
