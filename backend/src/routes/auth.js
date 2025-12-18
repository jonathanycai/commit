import express from "express";
import { supabase } from "../lib/supabase.js";
import { requireAuth } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { validatePasswordStrength, checkPasswordStrength } from "../middleware/passwordValidator.js";

const router = express.Router();

// Register new user
router.post("/register", authLimiter, validatePasswordStrength, async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({
            message: 'User registered successfully',
            user: data.user,
            session: data.session
        });
    } catch (error) {
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login user
router.post("/login", authLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return res.status(401).json({ error: error.message });
        }

        res.json({
            message: 'Login successful',
            user: data.user,
            session: data.session
        });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

// Auth health check
router.get("/health", requireAuth, (req, res) => {
    res.json({
        ok: true,
        userId: req.user.id,
        email: req.user.email
    });
});

// Password strength checker (for frontend validation)
router.post("/check-password", checkPasswordStrength);

export default router;
