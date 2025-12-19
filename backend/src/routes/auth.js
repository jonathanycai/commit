import express from "express";
import { supabase } from "../lib/supabase.js";
import { requireAuth } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { validatePasswordStrength, checkPasswordStrength } from "../middleware/passwordValidator.js";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

// Create a Supabase client with anon key for OAuth (needed for OAuth URL generation)
const supabaseAnon = process.env.SUPABASE_ANON_KEY 
    ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
    : null;

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

// Initiate Google OAuth flow
router.get("/google", authLimiter, async (req, res) => {
    try {
        if (!supabaseAnon) {
            return res.status(500).json({ error: 'OAuth not configured. SUPABASE_ANON_KEY is required.' });
        }

        const { data, error } = await supabaseAnon.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${req.protocol}://${req.get('host')}/auth/google/callback`,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
            },
        });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        // Redirect to Google OAuth URL
        res.redirect(data.url);
    } catch (error) {
        console.error('OAuth initiation error:', error);
        res.status(500).json({ error: 'OAuth initiation failed' });
    }
});

// Handle Google OAuth callback
router.get("/google/callback", async (req, res) => {
    try {
        const { code } = req.query;

        if (!code) {
            return res.status(400).json({ error: 'Authorization code not provided' });
        }

        if (!supabaseAnon) {
            return res.status(500).json({ error: 'OAuth not configured. SUPABASE_ANON_KEY is required.' });
        }

        // Exchange the code for a session
        const { data, error } = await supabaseAnon.auth.exchangeCodeForSession(code);

        if (error) {
            console.error('OAuth callback error:', error);
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth?error=${encodeURIComponent(error.message)}`);
        }

        // Redirect to frontend with tokens in URL hash (more secure than query params)
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const redirectUrl = `${frontendUrl}/auth/callback?access_token=${data.session.access_token}&refresh_token=${data.session.refresh_token}&expires_at=${data.session.expires_at}`;
        
        res.redirect(redirectUrl);
    } catch (error) {
        console.error('OAuth callback error:', error);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/auth?error=${encodeURIComponent('Authentication failed')}`);
    }
});

export default router;
