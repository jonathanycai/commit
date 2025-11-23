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
        const {
            username,
            role,
            experience,
            time_commitment,
            socials,
            tech_tags,
            project_links // ✅ NEW FIELD
        } = req.body;

        const updateData = {};
        if (username !== undefined) updateData.username = username;
        if (role !== undefined) updateData.role = role;
        if (experience !== undefined) updateData.experience = experience;
        if (time_commitment !== undefined) updateData.time_commitment = time_commitment;
        if (socials !== undefined) updateData.socials = socials;
        if (tech_tags !== undefined) updateData.tech_tags = tech_tags;
        if (project_links !== undefined) updateData.project_links = project_links; // ✅ Add support

        // Ensure defaults so Supabase doesn't choke on missing values
        // if (!updateData.socials) updateData.socials = {};
        // if (!updateData.tech_tags) updateData.tech_tags = [];
        // if (!updateData.project_links) updateData.project_links = []; 
        // this shit highkey sus, forces empty defaults, not necessary w new auth format type shit

        const { data, error } = await supabase
            .from("users")
            .update(updateData)
            .eq("id", req.user.id)
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
        console.error("Error updating profile:", error.message);
        res.status(500).json({ error: "Profile update failed" });
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

router.get("/check-username/:username", async (req, res) => {
    try {
        const { username } = req.params;

        const { data, error } = await supabase
            .from("users")
            .select("username")
            .eq("username", username)
            .single();

        // If we find a row, the username is taken
        if (data) {
            return res.json({ available: false });
        }

        // If no row found (error code PGRST116), it's available
        return res.json({ available: true });
    } catch (error) {
        // If error is "Row not found", that's good - username is available
        return res.json({ available: true });
    }
});

export default router;
