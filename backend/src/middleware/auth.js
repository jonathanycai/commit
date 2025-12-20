import { createAuthClient } from "../lib/supabase.js";

// Auth middleware to verify JWT tokens
export const requireAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
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
