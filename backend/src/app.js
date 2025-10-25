import "dotenv/config";
import express from "express";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(express.json());

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Auth middleware to verify JWT tokens
const requireAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token verification failed' });
    }
};

// checks if DB connection works
app.get("/health", async (_req, res) => {
    try {
        // simple query to confirm DB responds
        const { data, error } = await supabase.from("users").select("count").limit(1);
        if (error) throw error;
        res.json({ ok: true, db: "connected" });
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
});

// users table check
app.get("/health/users", async (_req, res) => {
    try {
        const { error } = await supabase.from("users").select("id").limit(1);
        if (error) throw error;
        res.json({ table: "users", ok: true });
    } catch (e) {
        res.status(500).json({ table: "users", ok: false, error: e.message });
    }
});

// projects table check
app.get("/health/projects", async (_req, res) => {
    try {
        const { error } = await supabase.from("projects").select("id").limit(1);
        if (error) throw error;
        res.json({ table: "projects", ok: true });
    } catch (e) {
        res.status(500).json({ table: "projects", ok: false, error: e.message });
    }
});

// applications table check
app.get("/health/applications", async (_req, res) => {
    try {
        const { error } = await supabase.from("applications").select("id").limit(1);
        if (error) throw error;
        res.json({ table: "applications", ok: true });
    } catch (e) {
        res.status(500).json({ table: "applications", ok: false, error: e.message });
    }
});

// swipes table check
app.get("/health/swipes", async (_req, res) => {
    try {
        const { error } = await supabase.from("swipes").select("id").limit(1);
        if (error) throw error;
        res.json({ table: "swipes", ok: true });
    } catch (e) {
        res.status(500).json({ table: "swipes", ok: false, error: e.message });
    }
});

// ===========================
// AUTHENTICATION ROUTES
// ===========================

// Register new user
app.post("/auth/register", async (req, res) => {
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
app.post("/auth/login", async (req, res) => {
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
app.get("/auth/health", requireAuth, (req, res) => {
    res.json({ 
        ok: true, 
        userId: req.user.id,
        email: req.user.email 
    });
});

// ===========================
// USER PROFILE ROUTES
// ===========================

// Create user profile (after registration)
app.post("/users", requireAuth, async (req, res) => {
    try {
        const { username, role, experience, time_commitment, socials, tech_tags } = req.body;
        
        // Check if profile already exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('id', req.user.id)
            .single();

        if (existingUser) {
            return res.status(400).json({ error: 'Profile already exists for this user' });
        }

        // Create profile
        const { data, error } = await supabase
            .from('users')
            .insert({
                id: req.user.id,
                email: req.user.email,
                username,
                role,
                experience,
                time_commitment,
                socials: socials || {},
                tech_tags: tech_tags || []
            })
            .select()
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({ 
            message: 'Profile created successfully', 
            profile: data 
        });
    } catch (error) {
        res.status(500).json({ error: 'Profile creation failed' });
    }
});

// Get user profile
app.get("/users/:id", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ profile: data });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// Update user profile
app.put("/users/:id", requireAuth, async (req, res) => {
    try {
        // Ensure user can only update their own profile
        if (req.params.id !== req.user.id) {
            return res.status(403).json({ error: 'Can only update your own profile' });
        }

        const { username, role, experience, time_commitment, socials, tech_tags } = req.body;
        
        const { data, error } = await supabase
            .from('users')
            .update({
                username,
                role,
                experience,
                time_commitment,
                socials: socials || {},
                tech_tags: tech_tags || []
            })
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({ 
            message: 'Profile updated successfully', 
            profile: data 
        });
    } catch (error) {
        res.status(500).json({ error: 'Profile update failed' });
    }
});


app.listen(process.env.PORT || 4000, () =>
    console.log(`running on http://localhost:${process.env.PORT || 4000}`)
);
