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
        const { title, description, tags, looking_for, time_commitment } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Project title is required' });
        }

        // Create project
        const { data, error } = await supabase
            .from('projects')
            .insert({
                owner_id: req.user.id,
                title,
                description: description || '',
                tags: tags || [],
                looking_for: looking_for || [],
                time_commitment: time_commitment || null,
                is_active: true
            })
            .select(`
                id,
                owner_id,
                title,
                description,
                tags,
                looking_for,
                time_commitment,
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
            search,
        } = req.query;

        // Check for optional auth to filter out own/applied projects
        let currentUserId = null;
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (token) {
            const { data: { user }, error } = await supabase.auth.getUser(token);
            if (!error && user) {
                currentUserId = user.id;
            }
        }

        const toArray = (val) => {
            if (!val) return [];
            if (Array.isArray(val)) return val;
            return val.split(',').map(v => v.trim());
        };

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
        time_commitment,
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

        // Apply user-specific filters if logged in
        if (currentUserId) {
            // 1. Exclude own projects
            query = query.neq('owner_id', currentUserId);

            // 2. Exclude applied projects
            const { data: applications } = await supabase
                .from('applications')
                .select('project_id')
                .eq('user_id', currentUserId);

            if (applications && applications.length > 0) {
                const appliedProjectIds = applications.map(app => app.project_id);
                query = query.not('id', 'in', `(${appliedProjectIds.join(',')})`);
            }
        }

        if (search && search.trim()) {
            query = query.or(
                `title.ilike.%${search.trim()}%,description.ilike.%${search.trim()}%`
            );
        }

        if (tags) {
            const tagArray = toArray(tags);
            if (tagArray.length > 0) query = query.overlaps("tags", tagArray);
        }

        if (looking_for) {
            const lookingArray = toArray(looking_for);
            if (lookingArray.length > 0) query = query.overlaps("looking_for", lookingArray);
        }

        if (role) {
            const roleArray = toArray(role);
            if (roleArray.length > 0) query = query.in("users.role", roleArray);
        }

        if (experience) {
            const expArray = toArray(experience);
            if (expArray.length > 0) query = query.in("users.experience", expArray);
        }

        if (time_commitment) {
            const timeArray = toArray(time_commitment);
            if (timeArray.length > 0) query = query.in("users.time_commitment", timeArray);
        }

        // Execute query
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
                search,
            },
            count: data?.length || 0,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch projects" });
    }
});

// Update a project (only by owner)
router.put("/:id", requireAuth, async (req, res) => {
    try {
        const projectId = req.params.id;
        const { title, description, tags, looking_for, time_commitment, is_active } = req.body;

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
                description,
                tags: tags || [],
                looking_for: looking_for || [],
                time_commitment: time_commitment || null,
                is_active: is_active !== undefined ? is_active : true
            })
            .eq('id', projectId)
            .select(`
                id,
                owner_id,
                title,
                description,
                tags,
                looking_for,
                time_commitment,
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
                description,
                tags,
                looking_for,
                time_commitment,
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
                description,
                tags,
                looking_for,
                time_commitment,
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
