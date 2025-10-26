import express from "express";
import { createClient } from "@supabase/supabase-js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Create a new project
router.post("/", requireAuth, async (req, res) => {
    try {
        const { title, project_name, description, tags, looking_for } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Project title is required' });
        }

        // Create project
        const { data, error } = await supabase
            .from('projects')
            .insert({
                owner_id: req.user.id,
                title,
                project_name: project_name || '',
                description: description || '',
                tags: tags || [],
                looking_for: looking_for || [],
                is_active: true
            })
            .select(`
                id,
                owner_id,
                title,
                project_name,
                description,
                tags,
                looking_for,
                is_active,
                created_at,
                users!projects_owner_id_fkey (
                    id,
                    username,
                    email,
                    role,
                    experience
                )
            `)
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({
            message: 'Project created successfully',
            project: data
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create project' });
    }
});

router.get("/", async (req, res) => {
    try {
        const {
            is_active = "true",
            tags,
            looking_for,
            role,
            experience,
            time_commitment,
        } = req.query;

        // Base query
        let query = supabase
            .from("projects")
            .select(
                `
          id,
          owner_id,
          title,
          description,
          tags,
          looking_for,
          is_active,
          created_at,
          users!projects_owner_id_fkey (
            id,
            username,
            email,
            role,
            experience,
            time_commitment
          )
        `
            )
            .eq("is_active", is_active === "true")
            .order("created_at", { ascending: false });

        // Filter by tags
        if (tags) {
            const tagArray = tags.split(",").map((t) => t.trim());
            query = query.overlaps("tags", tagArray);
        }

        // Filter by looking_for
        if (looking_for) {
            const lookingArray = looking_for.split(",").map((r) => r.trim());
            query = query.overlaps("looking_for", lookingArray);
        }

        // Filter by user profile fields (joined table)
        if (role) query = query.eq("users.role", role.trim());
        if (experience) query = query.eq("users.experience", experience.trim());
        if (time_commitment)
            query = query.eq("users.time_commitment", time_commitment.trim());

        const { data, error } = await query;

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.json({
            projects: data,
            filters: {
                tags,
                looking_for,
                role,
                experience,
                time_commitment,
            },
            count: data?.length || 0,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch projects" });
    }
});


// Get a specific project by ID
router.get("/:id", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('projects')
            .select(`
                id,
                owner_id,
                title,
                project_name,
                description,
                tags,
                looking_for,
                is_active,
                created_at,
                users!projects_owner_id_fkey (
                    id,
                    username,
                    email,
                    role,
                    experience,
                    time_commitment,
                    socials,
                    tech_tags
                )
            `)
            .eq('id', req.params.id)
            .single();

        if (error || !data) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.json({ project: data });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch project' });
    }
});

// Update a project (only by owner)
router.put("/:id", requireAuth, async (req, res) => {
    try {
        const projectId = req.params.id;
        const { title, project_name, description, tags, looking_for, is_active } = req.body;

        // Check if project exists and user owns it
        const { data: existingProject, error: fetchError } = await supabase
            .from('projects')
            .select('id, owner_id')
            .eq('id', projectId)
            .single();

        if (fetchError || !existingProject) {
            return res.status(404).json({ error: 'Project not found' });
        }

        if (existingProject.owner_id !== req.user.id) {
            return res.status(403).json({ error: 'Can only update your own projects' });
        }

        // Update project
        const { data, error } = await supabase
            .from('projects')
            .update({
                title,
                project_name: project_name || '',
                description,
                tags: tags || [],
                looking_for: looking_for || [],
                is_active: is_active !== undefined ? is_active : true
            })
            .eq('id', projectId)
            .select(`
                id,
                owner_id,
                title,
                project_name,
                description,
                tags,
                looking_for,
                is_active,
                created_at,
                users!projects_owner_id_fkey (
                    id,
                    username,
                    email,
                    role,
                    experience
                )
            `)
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({
            message: 'Project updated successfully',
            project: data
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update project' });
    }
});

// Delete a project (only by owner)
router.delete("/:id", requireAuth, async (req, res) => {
    try {
        const projectId = req.params.id;

        // Check if project exists and user owns it
        const { data: existingProject, error: fetchError } = await supabase
            .from('projects')
            .select('id, owner_id, title')
            .eq('id', projectId)
            .single();

        if (fetchError || !existingProject) {
            return res.status(404).json({ error: 'Project not found' });
        }

        if (existingProject.owner_id !== req.user.id) {
            return res.status(403).json({ error: 'Can only delete your own projects' });
        }

        // Delete project (this will cascade delete applications due to foreign key)
        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', projectId);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({
            message: `Project "${existingProject.title}" deleted successfully`
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

// Get projects owned by the current user
router.get("/my/projects", requireAuth, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('projects')
            .select(`
                id,
                owner_id,
                title,
                project_name,
                description,
                tags,
                looking_for,
                is_active,
                created_at
            `)
            .eq('owner_id', req.user.id)
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.json({
            my_projects: data,
            count: data.length
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch your projects' });
    }
});

// Search projects by title or description
router.get("/search/:query", async (req, res) => {
    try {
        const { query } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const { data, error } = await supabase
            .from('projects')
            .select(`
                id,
                owner_id,
                title,
                project_name,
                description,
                tags,
                looking_for,
                is_active,
                created_at,
                users!projects_owner_id_fkey (
                    id,
                    username,
                    email,
                    role,
                    experience
                )
            `)
            .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.json({
            projects: data,
            query,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: data.length,
                totalPages: Math.ceil(data.length / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to search projects' });
    }
});

export default router;
