import express from "express";
import { createClient } from "@supabase/supabase-js";
import { requireAuth } from "../middleware/auth.js";
import { applicationLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Send request to join a project
router.post("/", requireAuth, applicationLimiter, async (req, res) => {
    try {
        const { project_id } = req.body; // no longer taking blurb
        const user_id = req.user.id;

        if (!project_id) {
            return res.status(400).json({ error: "Project ID is required" });
        }

        // Check if project exists
        const { data: project, error: projectError } = await supabase
            .from("projects")
            .select("id, owner_id, title")
            .eq("id", project_id)
            .single();

        if (projectError || !project) {
            return res.status(404).json({ error: "Project not found" });
        }

        // Prevent applying to your own project
        if (project.owner_id === user_id) {
            return res
                .status(400)
                .json({ error: "Cannot apply to your own project" });
        }

        // Check if an application already exists
        const { data: existingApp } = await supabase
            .from("applications")
            .select("id")
            .eq("project_id", project_id)
            .eq("user_id", user_id)
            .single();

        if (existingApp) {
            return res
                .status(400)
                .json({ error: "Application already exists for this project" });
        }

        // Create new application (hardcoded blurb = "")
        const { data, error } = await supabase
            .from("applications")
            .insert({
                project_id,
                user_id,
                blurb: "", // hardcoded empty string
                status: "pending",
            })
            .select(
                `
          id,
          project_id,
          user_id,
          blurb,
          status,
          created_at,
          projects (
            id,
            title,
            description,
            owner_id,
            users!projects_owner_id_fkey (
              id,
              username,
              email
            )
          ),
          users!applications_user_id_fkey (
            id,
            username,
            email,
            role,
            experience
          )
        `
            )
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({
            message: "Application sent successfully",
            application: data,
        });
    } catch (error) {
        console.error("Error creating application:", error.message);
        res.status(500).json({ error: "Failed to send application" });
    }
});

// Get successful requests (approved applications the user made)
router.get("/successful", requireAuth, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('applications')
            .select(`
                id,
                project_id,
                blurb,
                status,
                created_at,
                projects (
                    id,
                    title,
                    description,
                    tags,
                    looking_for,
                    users!projects_owner_id_fkey (
                        id,
                        username,
                        email,
                        socials
                    )
                )
            `)
            .eq('user_id', req.user.id)
            .eq('status', 'accepted')
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.json({
            successful_requests: data,
            count: data.length
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch successful requests' });
    }
});

// Get received requests (requests to user's projects)
router.get("/received", requireAuth, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('applications')
            .select(`
                id,
                project_id,
                user_id,
                blurb,
                status,
                created_at,
                projects (
                    id,
                    title,
                    description
                ),
                users!applications_user_id_fkey (
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
            .eq('projects.owner_id', req.user.id)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.json({
            received_requests: data,
            count: data.length
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch received requests' });
    }
});

// Approve an application
router.post("/:id/approve", requireAuth, async (req, res) => {
    try {
        const applicationId = req.params.id;

        // Get the application with project info
        const { data: application, error: fetchError } = await supabase
            .from('applications')
            .select(`
                id,
                project_id,
                user_id,
                status,
                projects (
                    id,
                    owner_id,
                    title
                )
            `)
            .eq('id', applicationId)
            .single();

        if (fetchError || !application) {
            return res.status(404).json({ error: 'Application not found' });
        }

        // Check if user owns the project
        if (application.projects.owner_id !== req.user.id) {
            return res.status(403).json({ error: 'Can only approve applications to your own projects' });
        }

        // Check if application is still pending
        if (application.status !== 'pending') {
            return res.status(400).json({ error: 'Application has already been processed' });
        }

        // Update application status to accepted
        const { data, error } = await supabase
            .from('applications')
            .update({ status: 'accepted' })
            .eq('id', applicationId)
            .select(`
                id,
                project_id,
                user_id,
                blurb,
                status,
                created_at,
                projects (
                    id,
                    title,
                    description,
                    users!projects_owner_id_fkey (
                        id,
                        username,
                        email,
                        socials
                    )
                ),
                users!applications_user_id_fkey (
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

        // Create notification for the applicant
        await supabase
            .from('notifications')
            .insert({
                receiver_id: application.user_id,
                sender_id: req.user.id,
                project_id: application.project_id,
                type: 'approval',
                message: `Your application to join "${application.projects.title}" has been approved!`
            });

        res.json({
            message: 'Application approved successfully',
            application: data
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to approve application' });
    }
});

// Reject an application (delete it)
router.delete("/:id/reject", requireAuth, async (req, res) => {
    try {
        const applicationId = req.params.id;

        // Get the application with project info
        const { data: application, error: fetchError } = await supabase
            .from('applications')
            .select(`
                id,
                project_id,
                user_id,
                status,
                projects (
                    id,
                    owner_id,
                    title
                )
            `)
            .eq('id', applicationId)
            .single();

        if (fetchError || !application) {
            return res.status(404).json({ error: 'Application not found' });
        }

        // Check if user owns the project
        if (application.projects.owner_id !== req.user.id) {
            return res.status(403).json({ error: 'Can only reject applications to your own projects' });
        }

        // Check if application is still pending
        if (application.status !== 'pending') {
            return res.status(400).json({ error: 'Application has already been processed' });
        }

        // Delete the application
        const { error } = await supabase
            .from('applications')
            .delete()
            .eq('id', applicationId);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        // Create notification for the applicant
        await supabase
            .from('notifications')
            .insert({
                receiver_id: application.user_id,
                sender_id: req.user.id,
                project_id: application.project_id,
                type: 'rejection',
                message: `Your application to join "${application.projects.title}" was not accepted.`
            });

        res.json({
            message: 'Application rejected and removed successfully'
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to reject application' });
    }
});

// Get all applications for a specific project (for project owners)
router.get("/project/:projectId", requireAuth, async (req, res) => {
    try {
        const projectId = req.params.projectId;

        // Check if user owns the project
        const { data: project, error: projectError } = await supabase
            .from('projects')
            .select('id, owner_id')
            .eq('id', projectId)
            .single();

        if (projectError || !project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        if (project.owner_id !== req.user.id) {
            return res.status(403).json({ error: 'Can only view applications for your own projects' });
        }

        // Get all applications for this project
        const { data, error } = await supabase
            .from('applications')
            .select(`
                id,
                user_id,
                blurb,
                status,
                created_at,
                users!applications_user_id_fkey (
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
            .eq('project_id', projectId)
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.json({
            project_applications: data,
            count: data.length
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch project applications' });
    }
});

// Get matches (both successful applications and approved applications)
router.get("/matches", requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Get successful applications (where user applied and was accepted)
        const { data: successfulApps, error: successfulError } = await supabase
            .from('applications')
            .select(`
                id,
                project_id,
                blurb,
                status,
                created_at,
                projects (
                    id,
                    title,
                    description,
                    tags,
                    looking_for,
                    users!projects_owner_id_fkey (
                        id,
                        username,
                        email,
                        socials
                    )
                )
            `)
            .eq('user_id', userId)
            .eq('status', 'accepted')
            .order('created_at', { ascending: false });

        if (successfulError) {
            console.error('Successful apps error:', successfulError);
            return res.status(500).json({ error: `Successful apps error: ${successfulError.message}` });
        }

        // Get approved applications (where user's project received accepted applications)
        const { data: approvedApps, error: approvedError } = await supabase
            .from('applications')
            .select(`
                id,
                project_id,
                user_id,
                blurb,
                status,
                created_at,
                projects (
                    id,
                    title,
                    description,
                    tags,
                    looking_for
                ),
                users!applications_user_id_fkey (
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
            .eq('projects.owner_id', userId)
            .eq('status', 'accepted')
            .order('created_at', { ascending: false });

        if (approvedError) {
            console.error('Approved apps error:', approvedError);
            return res.status(500).json({ error: `Approved apps error: ${approvedError.message}` });
        }

        // Transform data to match the expected format
        const matches = [
            // Successful applications (user was accepted to projects)
            ...(successfulApps || []).map(app => ({
                id: app.id,
                type: 'successful',
                project: {
                    id: app.projects?.id,
                    title: app.projects?.title || 'Unknown Project',
                    description: app.projects?.description || '',
                    tags: app.projects?.tags || [],
                    looking_for: app.projects?.looking_for || []
                },
                user: {
                    id: app.projects?.users?.id,
                    username: app.projects?.users?.username || 'Unknown User',
                    email: app.projects?.users?.email || '',
                    socials: app.projects?.users?.socials || {}
                },
                created_at: app.created_at
            })),
            // Approved applications (user's projects got accepted applications)
            ...(approvedApps || []).map(app => ({
                id: app.id,
                type: 'approved',
                project: {
                    id: app.projects?.id,
                    title: app.projects?.title || 'Unknown Project',
                    description: app.projects?.description || '',
                    tags: app.projects?.tags || [],
                    looking_for: app.projects?.looking_for || []
                },
                user: {
                    id: app.users?.id,
                    username: app.users?.username || 'Unknown User',
                    email: app.users?.email || '',
                    role: app.users?.role,
                    experience: app.users?.experience,
                    time_commitment: app.users?.time_commitment,
                    socials: app.users?.socials || {},
                    tech_tags: app.users?.tech_tags || []
                },
                created_at: app.created_at
            }))
        ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        res.json({
            matches: matches,
            count: matches.length,
            successful_count: successfulApps?.length || 0,
            approved_count: approvedApps?.length || 0
        });
    } catch (error) {
        console.error('Error fetching matches:', error);
        res.status(500).json({ error: `Failed to fetch matches: ${error.message}` });
    }
});

// Get all projects the user has NOT applied to
router.get("/unapplied", requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            is_active = "true",
            tags,
            looking_for,
            role,
            experience,
            time_commitment,
        } = req.query;

        // Step 1: Get all project IDs the user has already applied to
        const { data: appliedProjects, error: appliedError } = await supabase
            .from("applications")
            .select("project_id")
            .eq("user_id", userId);

        if (appliedError) throw appliedError;

        const appliedIds = appliedProjects?.map((a) => a.project_id) || [];

        // Step 2: Build the main query excluding those projects
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

        // Exclude projects already applied to
        if (appliedIds.length > 0) {
            query = query.not("id", "in", `(${appliedIds.join(",")})`);
        }

        // Optional filters
        if (tags) {
            const tagArray = tags.split(",").map((t) => t.trim());
            query = query.overlaps("tags", tagArray);
        }

        if (looking_for) {
            const lookingArray = looking_for.split(",").map((r) => r.trim());
            query = query.overlaps("looking_for", lookingArray);
        }

        if (role) query = query.eq("users.role", role.trim());
        if (experience) query = query.eq("users.experience", experience.trim());
        if (time_commitment)
            query = query.eq("users.time_commitment", time_commitment.trim());

        // Step 3: Run query
        const { data, error } = await query;

        if (error) throw error;

        res.json({
            projects: data,
            excluded_project_ids: appliedIds,
            count: data?.length || 0,
        });
    } catch (error) {
        console.error("Error fetching unapplied projects:", error.message);
        res.status(500).json({ error: "Failed to fetch unapplied projects" });
    }
});

export default router;
