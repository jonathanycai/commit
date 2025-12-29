import rateLimit from 'express-rate-limit';
import express from 'express';

// Environment-based rate limiting configuration
const isDevelopment = process.env.NODE_ENV !== 'production';

// Create router for rate limit status endpoint
const router = express.Router();

// General API rate limiting - relaxed for development, strict for production
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: isDevelopment ? 1000 : 1000, // 1000 requests per 15 minutes for both dev and prod
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res) => {
        res.status(429).json({
            error: 'Too many requests from this IP, please try again later.',
            retryAfter: '15 minutes',
            limit: 1000,
            windowMs: '15 minutes',
            environment: isDevelopment ? 'development' : 'production'
        });
    }
});

// Environment-based rate limiting for authentication endpoints
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: isDevelopment ? 50 : 20, // 50 for dev, 20 for production
    message: {
        error: 'Too many authentication attempts, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            error: 'Too many authentication attempts, please try again later.',
            retryAfter: '15 minutes',
            limit: isDevelopment ? 50 : 20,
            windowMs: '15 minutes',
            environment: isDevelopment ? 'development' : 'production'
        });
    },
    // Skip successful requests (don't count successful logins against the limit)
    skipSuccessfulRequests: true
});

// Moderate rate limiting for user actions - 20 requests per 15 minutes
export const userActionLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 20 requests per windowMs
    message: {
        error: 'Too many user actions from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            error: 'Too many user actions from this IP, please try again later.',
            retryAfter: '15 minutes',
            limit: 20,
            windowMs: '15 minutes'
        });
    }
});

// Environment-based rate limiting for project creation
export const projectCreationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: isDevelopment ? 20 : 3, // 20 for dev, 3 for production
    message: {
        error: 'Too many project creations, please try again later.',
        retryAfter: '1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            error: 'Too many project creations, please try again later.',
            retryAfter: '1 hour',
            limit: isDevelopment ? 20 : 3,
            windowMs: '1 hour',
            environment: isDevelopment ? 'development' : 'production'
        });
    }
});

// Environment-based rate limiting for application submissions
export const applicationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: isDevelopment ? 200 : 100, // Increased from 50/10 to allow for "swiping right" flow
    message: {
        error: 'Too many application submissions, please try again later.',
        retryAfter: '1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            error: 'Too many application submissions, please try again later.',
            retryAfter: '1 hour',
            limit: isDevelopment ? 200 : 100,
            windowMs: '1 hour',
            environment: isDevelopment ? 'development' : 'production'
        });
    }
});

// Rate limit status endpoint
router.get('/status', (req, res) => {
    res.json({
        environment: process.env.NODE_ENV || 'development',
        isDevelopment,
        limits: {
            general: {
                max: isDevelopment ? 1000 : 100,
                windowMs: '15 minutes',
                description: 'General API requests'
            },
            auth: {
                max: isDevelopment ? 50 : 5,
                windowMs: '15 minutes',
                description: 'Authentication attempts (login/register)'
            },
            projects: {
                max: isDevelopment ? 20 : 3,
                windowMs: '1 hour',
                description: 'Project creation'
            },
            applications: {
                max: isDevelopment ? 50 : 10,
                windowMs: '1 hour',
                description: 'Application submissions'
            }
        },
        note: isDevelopment
            ? 'Development mode: Relaxed limits for testing'
            : 'Production mode: Strict security limits'
    });
});

// Export the router for rate limit status
export const rateLimitStatusRouter = router;
