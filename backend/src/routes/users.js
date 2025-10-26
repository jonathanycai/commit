import express from "express";
import { createClient } from "@supabase/supabase-js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Create user profile (after registration)
router.post("/", requireAuth, async (req, res) => {
    try {
        const {
            username,
            role,
            experience,
            time_commitment,
            socials,
            tech_tags,
            project_links, // new field
        } = req.body;

        // Check if profile already exists
        const { data: existingUser } = await supabase
            .from("users")
            .select("id")
            .eq("id", req.user.id)
            .single();

        if (existingUser) {
            return res
                .status(400)
                .json({ error: "Profile already exists for this user" });
        }

        // Create new profile
        const { data, error } = await supabase
            .from("users")
            .insert({
                id: req.user.id,
                email: req.user.email,
                username,
                role,
                experience,
                time_commitment,
                socials: socials || {},
                tech_tags: tech_tags || [],
                project_links: project_links || [], // added here
            })
            .select()
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({
            message: "Profile created successfully",
            profile: data,
        });
    } catch (error) {
        res.status(500).json({ error: "Profile creation failed" });
    }
});

// Get current user profile
router.get("/profile", requireAuth, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', req.user.id)
            .single();

        if (error) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        res.json({ profile: data });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// Update current user profile
router.put("/profile", requireAuth, async (req, res) => {
    try {
        const { username, role, experience, time_commitment, socials, tech_tags } = req.body;
        
        const updateData = {};
        if (username !== undefined) updateData.username = username;
        if (role !== undefined) updateData.role = role;
        if (experience !== undefined) updateData.experience = experience;
        if (time_commitment !== undefined) updateData.time_commitment = time_commitment;
        if (socials !== undefined) updateData.socials = socials;
        if (tech_tags !== undefined) updateData.tech_tags = tech_tags;
        
        const { data, error } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', req.user.id)
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

// Get user profile by ID
router.get("/:id", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", req.params.id)
            .single();

        if (error) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ profile: data });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch profile" });
    }
});

// Update user profile
router.put("/:id", requireAuth, async (req, res) => {
    try {
        if (req.params.id !== req.user.id) {
            return res.status(403).json({ error: "Can only update your own profile" });
        }

        const {
            username,
            role,
            experience,
            time_commitment,
            socials,
            tech_tags,
            project_links, // new field
        } = req.body;

        const { data, error } = await supabase
            .from("users")
            .update({
                username,
                role,
                experience,
                time_commitment,
                socials: socials || {},
                tech_tags: tech_tags || [],
                project_links: project_links || [], // added here
            })
            .eq("id", req.params.id)
            .select()
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({
            message: "Profile updated successfully",
            profile: data,
        });
    } catch (error) {
        res.status(500).json({ error: "Profile update failed" });
    }
});

export default router;
