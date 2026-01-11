import { createAuthClient } from "../lib/supabase.js";

// Auth middleware to verify JWT tokens
// Reads from httpOnly cookies (secure) with fallback to Authorization header (for compatibility)
export const requireAuth = async (req, res, next) => {
    try {
        // Priority: 1. Cookie (httpOnly, secure), 2. Authorization header (for compatibility)
        const token = req.cookies?.access_token || req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const authClient = createAuthClient();
        const { data: { user }, error } = await authClient.auth.getUser(token);
        if (error || !user) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token verification failed' });
    }
};
