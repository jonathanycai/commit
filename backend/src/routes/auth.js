import express from "express";
import { createAuthClient } from "../lib/supabase.js";
import { requireAuth } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { validatePasswordStrength, checkPasswordStrength } from "../middleware/passwordValidator.js";
import {
    AUTH_COOKIE_NAME,
    REFRESH_COOKIE_NAME,
    CSRF_COOKIE_NAME,
    getAuthCookieOptions,
    getCsrfCookieOptions,
} from "../config/cookies.js";
import { issueCsrfCookie } from "../middleware/csrf.js";

const router = express.Router();

// Helper function to set httpOnly cookies for tokens
const setAuthCookies = (res, accessToken, refreshToken, expiresAt) => {
    const accessMaxAgeMs =
        typeof expiresAt === "number" ? Math.max(expiresAt * 1000 - Date.now(), 0) : 1000 * 60 * 60;

    res.cookie(AUTH_COOKIE_NAME, accessToken, getAuthCookieOptions({ maxAgeMs: accessMaxAgeMs }));
    res.cookie(
        REFRESH_COOKIE_NAME,
        refreshToken,
        getAuthCookieOptions({ maxAgeMs: 1000 * 60 * 60 * 24 * 30 })
    );
};

// Helper function to clear auth cookies
// Must use same options as setCookie to ensure proper clearing
const clearAuthCookies = (res) => {
    const cookieOptions = getAuthCookieOptions();
    res.clearCookie(AUTH_COOKIE_NAME, cookieOptions);
    res.clearCookie(REFRESH_COOKIE_NAME, cookieOptions);

    // CSRF cookie is not httpOnly, but we clear it on logout.
    res.clearCookie(CSRF_COOKIE_NAME, getCsrfCookieOptions());
};

// Issue/refresh CSRF cookie (double-submit token strategy)
router.get("/csrf", (req, res) => {
    issueCsrfCookie(res);
    res.json({ ok: true });
});

// Register new user
router.post("/register", authLimiter, validatePasswordStrength, async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const authClient = createAuthClient();
        const { data, error } = await authClient.auth.signUp({
            email,
            password,
        });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        // Set httpOnly cookies instead of returning tokens in response
        if (data.session) {
            setAuthCookies(res, data.session.access_token, data.session.refresh_token, data.session.expires_at);
            issueCsrfCookie(res);
        }

        // Return user info without tokens (security: tokens are in httpOnly cookies)
        res.json({
            message: 'User registered successfully',
            user: data.user
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

        const authClient = createAuthClient();
        const { data, error } = await authClient.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return res.status(401).json({ error: error.message });
        }

        // Set httpOnly cookies instead of returning tokens in response
        if (data.session) {
            setAuthCookies(res, data.session.access_token, data.session.refresh_token, data.session.expires_at);
            issueCsrfCookie(res);
        }

        // Return user info without tokens (security: tokens are in httpOnly cookies)
        res.json({
            message: 'Login successful',
            user: data.user
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

// Session hydration endpoint
router.get("/me", requireAuth, (req, res) => {
    res.json({
        user: {
            id: req.user.id,
            email: req.user.email,
        },
    });
});

// Cookie status endpoint - check if cookies are being used (safe for debugging)
router.get("/cookie-status", (req, res) => {
    const hasAccessToken = !!req.cookies?.[AUTH_COOKIE_NAME];
    const hasRefreshToken = !!req.cookies?.[REFRESH_COOKIE_NAME];
    const allCookies = req.cookies || {};
    const cookieNames = Object.keys(allCookies);

    res.json({
        cookiesEnabled: true,
        hasAccessTokenCookie: hasAccessToken,
        hasRefreshTokenCookie: hasRefreshToken,
        cookieCount: cookieNames.length,
        cookieNames,
        // Note: httpOnly cookies cannot be read by JavaScript, but they are sent automatically with requests
        message: hasAccessToken && hasRefreshToken
            ? 'Cookies are present and being used'
            : 'No auth cookies found. Please log in.',
    });
});

// Password strength checker (for frontend validation)
router.post("/check-password", checkPasswordStrength);

// Logout endpoint - clears auth cookies
router.post("/logout", (req, res) => {
    clearAuthCookies(res);
    res.json({ message: 'Logged out successfully' });
});

// OAuth callback endpoint - sets httpOnly cookies from OAuth tokens
router.post("/oauth/callback", authLimiter, async (req, res) => {
    try {
        const { access_token, refresh_token, expires_at } = req.body;

        if (!access_token || !refresh_token) {
            return res.status(400).json({ error: 'Access token and refresh token are required' });
        }

        // Verify the token is valid by getting user info
        const authClient = createAuthClient();
        const { data: { user }, error } = await authClient.auth.getUser(access_token);

        if (error || !user) {
            return res.status(401).json({ error: 'Invalid access token' });
        }

        // Set httpOnly cookies
        setAuthCookies(res, access_token, refresh_token, expires_at);
        issueCsrfCookie(res);

        // Return user info
        res.json({
            message: 'OAuth authentication successful',
            user: {
                id: user.id,
                email: user.email,
                created_at: user.created_at,
                updated_at: user.updated_at,
            }
        });
    } catch (error) {
        console.error('OAuth callback error:', error);
        res.status(500).json({ error: 'OAuth callback failed' });
    }
});

// Initiate Google OAuth flow
// router.get("/google", authLimiter, async (req, res) => {
//     try {
//         const authClient = createAuthClient();

//         console.log('Initiating Google OAuth');

//         const { data, error } = await authClient.auth.signInWithOAuth({
//             provider: 'google',
//             options: {
//                 // Redirect to backend callback first so we can extract user info, then redirect to frontend
//                 // IMPORTANT: This URL must be added to Supabase Dashboard -> Authentication -> URL Configuration -> Redirect URLs
//                 redirectTo: `${req.protocol}://${req.get('host')}/auth/google/callback`,
//                 queryParams: {
//                     access_type: 'offline',
//                     prompt: 'consent',
//                 },
//             },
//         });

//         if (error) {
//             console.error('OAuth initiation error:', error);
//             return res.status(400).json({ error: error.message });
//         }

//         if (!data.url) {
//             console.error('No OAuth URL returned from Supabase');
//             return res.status(500).json({ error: 'Failed to generate OAuth URL' });
//         }

//         console.log('Redirecting to OAuth URL:', data.url);
//         // Redirect to Google OAuth URL
//         res.redirect(data.url);
//     } catch (error) {
//         console.error('OAuth initiation error:', error);
//         res.status(500).json({ error: 'OAuth initiation failed' });
//     }
// });

// Handle Google OAuth callback
// router.get("/google/callback", async (req, res) => {
//     try {
//         // Log all query parameters for debugging
//         console.log('OAuth callback received query params:', req.query);

//         const { code, error: oauthError, error_description } = req.query;

//         // Check for OAuth errors first
//         if (oauthError) {
//             console.error('OAuth error:', oauthError, error_description);
//             const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
//             return res.redirect(`${frontendUrl}/auth?error=${encodeURIComponent(error_description || oauthError)}`);
//         }

//         if (!code) {
//             console.error('No code parameter in callback. Query params:', req.query);
//             const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
//             return res.redirect(`${frontendUrl}/auth?error=${encodeURIComponent('Authorization code not provided')}`);
//         }

//         const authClient = createAuthClient();

//         // Exchange the code for a session
//         const { data, error } = await authClient.auth.exchangeCodeForSession(code);

//         if (error) {
//             console.error('OAuth callback error during code exchange:', error);
//             const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
//             return res.redirect(`${frontendUrl}/auth?error=${encodeURIComponent(error.message)}`);
//         }

//         if (!data.session) {
//             console.error('No session in OAuth callback response');
//             const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
//             return res.redirect(`${frontendUrl}/auth?error=${encodeURIComponent('Failed to create session')}`);
//         }

//         // Get user info from session (includes Google profile data like name, email, etc.)
//         const userInfo = data.user;
//         console.log('OAuth user info:', JSON.stringify(userInfo, null, 2));
//         const userEmail = userInfo.email || '';
//         // Try multiple sources for the name from Google OAuth
//         const userName = userInfo.user_metadata?.full_name
//             || userInfo.user_metadata?.name
//             || userInfo.user_metadata?.display_name
//             || userInfo.raw_user_meta_data?.full_name
//             || userInfo.raw_user_meta_data?.name
//             || userEmail.split('@')[0]
//             || 'User';

//         console.log('Extracted user name:', userName, 'email:', userEmail);

//         // Redirect to frontend with tokens and user info
//         const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
//         const redirectUrl = `${frontendUrl}/auth/callback?access_token=${data.session.access_token}&refresh_token=${data.session.refresh_token}&expires_at=${data.session.expires_at}&user_id=${encodeURIComponent(userInfo.id)}&user_email=${encodeURIComponent(userEmail)}&user_name=${encodeURIComponent(userName)}`;

//         res.redirect(redirectUrl);
//     } catch (error) {
//         console.error('OAuth callback exception:', error);
//         const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
//         res.redirect(`${frontendUrl}/auth?error=${encodeURIComponent('Authentication failed')}`);
//     }
// });

export default router;
