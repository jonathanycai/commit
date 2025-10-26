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
        const { project_id, blurb } = req.body;
        
        if (!project_id) {
            return res.status(400).json({ error: 'Project ID is required' });
        }

        // Check if project exists
        const { data: project, error: projectError } = await supabase
            .from('projects')
            .select('id, owner_id, title')
            .eq('id', project_id)
            .single();

        if (projectError || !project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Check if user is trying to apply to their own project
        if (project.owner_id === req.user.id) {
            return res.status(400).json({ error: 'Cannot apply to your own project' });
        }

        // Check if application already exists
        const { data: existingApp } = await supabase
            .from('applications')
            .select('id')
            .eq('project_id', project_id)
            .eq('user_id', req.user.id)
            .single();

        if (existingApp) {
            return res.status(400).json({ error: 'Application already exists for this project' });
        }

        // Create application
        const { data, error } = await supabase
            .from('applications')
            .insert({
                project_id,
                user_id: req.user.id,
                blurb: blurb || '',
                status: 'pending'
            })
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
            `)
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({ 
            message: 'Application sent successfully', 
            application: data 
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send application' });
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

export default router;
