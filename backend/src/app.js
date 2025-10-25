import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import healthRoutes from "./routes/health.js";
import applicationRoutes from "./routes/applications.js";
import projectRoutes from "./routes/projects.js";
import swipesRoutes from "./swipes/routes.js";

const app = express();
app.use(cors());
app.use(express.json());

// ===========================
// ROUTE IMPORTS
// ===========================

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

// Swipes functionality
app.use("/swipes", swipesRoutes);


app.listen(process.env.PORT || 4000, () =>
    console.log(`running on http://localhost:${process.env.PORT || 4000}`)
);
