import express from "express";
import {
    getNextProjectController,
    recordProjectSwipeController,
    getNextUserController,
    recordUserSwipeController,
    getMatchesController,
    swipesHealthController,
    clearSwipesController,
    debugUsersController,
    createTestApplicationsController
} from "./controller.js";

const router = express.Router();

// ===========================
// USER → PROJECT SWIPING
// ===========================

// GET /swipes/next-project - Pull a random project the user hasn't swiped on yet
router.get("/next-project", getNextProjectController);

// POST /swipes/project - Record user's swipe on a project
router.post("/project", recordProjectSwipeController);

// ===========================
// PROJECT → USER SWIPING
// ===========================

// GET /swipes/next-user - Pull a random user for project swiping
router.get("/next-user", getNextUserController);

// POST /swipes/user - Record project owner's swipe on a user
router.post("/user", recordUserSwipeController);

// ===========================
// UTILITY ENDPOINTS
// ===========================

// GET /swipes/matches - List all mutual likes for current user
router.get("/matches", getMatchesController);

// GET /swipes/health - Simple status check for the swipes table
router.get("/health", swipesHealthController);

// DELETE /swipes/debug/clear-swipes/:userId - Clear swipes for testing
router.delete("/debug/clear-swipes/:userId", clearSwipesController);

// GET /swipes/debug/users - Debug: see all users
router.get("/debug/users", debugUsersController);

// POST /swipes/debug/create-applications/:projectId - Create test applications for a project
router.post("/debug/create-applications/:projectId", createTestApplicationsController);

export default router;
