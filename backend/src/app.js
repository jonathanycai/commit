import "dotenv/config";
import express from "express";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import healthRoutes from "./routes/health.js";

const app = express();
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


app.listen(process.env.PORT || 4000, () =>
    console.log(`running on http://localhost:${process.env.PORT || 4000}`)
);
