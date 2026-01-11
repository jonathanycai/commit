import { verifyAccessToken } from "../lib/jwt.js";

// Auth middleware to verify JWT tokens
export const requireAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const payload = verifyAccessToken(token);
        req.user = { id: payload.sub, email: payload.email };
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token verification failed' });
    }
};
