import { supabase } from "../lib/supabase.js";
import { 
    getRandomProject, 
    getRandomUser, 
    recordSwipe, 
    detectMatch, 
    validateUUID 
} from "./helpers.js";

// Controller for getting next project for user swiping
export async function getNextProjectController(req, res) {
    try {
        const { userId } = req.query;
        
        if (!userId) {
            return res.status(400).json({ error: "userId query parameter is required" });
        }

        if (!validateUUID(userId)) {
            return res.status(400).json({ error: "Invalid user ID format" });
        }

        const project = await getRandomProject(userId);
        
        if (!project) {
            return res.json({ message: "No more projects available." });
        }

        res.json(project);

    } catch (error) {
        console.error("Error fetching next project:", error);
        res.status(500).json({ error: "Failed to fetch next project" });
    }
}

// Controller for recording user's swipe on a project
export async function recordProjectSwipeController(req, res) {
    try {
        const { project_id, direction, userId } = req.body;

        // Validate required fields
        if (!project_id || !direction || !userId) {
            return res.status(400).json({ 
                error: "Missing required fields: project_id, direction, userId" 
            });
        }

        // Validate direction
        if (!["like", "pass"].includes(direction)) {
            return res.status(400).json({ 
                error: "Invalid direction. Must be 'like' or 'pass'" 
            });
        }

        // Validate UUIDs
        if (!validateUUID(userId) || !validateUUID(project_id)) {
            return res.status(400).json({ error: "Invalid ID format" });
        }

        // Check if user already swiped on this project
        const { data: existingSwipe, error: checkError } = await supabase
            .from("swipes")
            .select("id")
            .eq("swiper_id", userId)
            .eq("target_project_id", project_id)
            .single();

        if (checkError && checkError.code !== "PGRST116") { // PGRST116 = no rows found
            throw checkError;
        }

        if (existingSwipe) {
            return res.status(409).json({ 
                error: "User has already swiped on this project" 
            });
        }

        // Verify project exists and is active
        const { data: project, error: projectError } = await supabase
            .from("projects")
            .select("id, is_active, owner_id")
            .eq("id", project_id)
            .single();

        if (projectError) throw projectError;

        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }

        if (!project.is_active) {
            return res.status(400).json({ error: "Project is no longer active" });
        }

        if (project.owner_id === userId) {
            return res.status(400).json({ error: "Cannot swipe on your own project" });
        }

        // Record the swipe
        const newSwipe = await recordSwipe(userId, project_id, direction, 'project');

        // Check for match if it's a like
        let matchResult = false;
        if (direction === 'like') {
            matchResult = await detectMatch(userId, project_id, 'project');
        }

        const response = {
            success: true,
            swipe: newSwipe,
            message: direction === "like" ? "Project liked!" : "Project passed"
        };

        if (matchResult) {
            response.match = true;
            response.project_id = project_id;
        }

        res.json(response);

    } catch (error) {
        console.error("Error recording project swipe:", error);
        res.status(500).json({ error: "Failed to record swipe" });
    }
}

// Controller for getting next user for project swiping
export async function getNextUserController(req, res) {
    try {
        const { projectId } = req.query;
        
        if (!projectId) {
            return res.status(400).json({ error: "projectId query parameter is required" });
        }

        if (!validateUUID(projectId)) {
            return res.status(400).json({ error: "Invalid project ID format" });
        }

        const user = await getRandomUser(projectId);
        
        if (!user) {
            return res.json({ message: "No more users available." });
        }

        res.json(user);

    } catch (error) {
        console.error("Error fetching next user:", error);
        res.status(500).json({ error: "Failed to fetch next user" });
    }
}

// Controller for recording project owner's swipe on a user
export async function recordUserSwipeController(req, res) {
    try {
        const { user_id, project_id, direction } = req.body;

        // Validate required fields
        if (!user_id || !project_id || !direction) {
            return res.status(400).json({ 
                error: "Missing required fields: user_id, project_id, direction" 
            });
        }

        // Validate direction
        if (!["like", "pass"].includes(direction)) {
            return res.status(400).json({ 
                error: "Invalid direction. Must be 'like' or 'pass'" 
            });
        }

        // Validate UUIDs
        if (!validateUUID(user_id) || !validateUUID(project_id)) {
            return res.status(400).json({ error: "Invalid ID format" });
        }

        // Get project details to get owner_id
        const { data: project, error: projectError } = await supabase
            .from("projects")
            .select("id, is_active, owner_id")
            .eq("id", project_id)
            .single();

        if (projectError) throw projectError;

        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }

        if (!project.is_active) {
            return res.status(400).json({ error: "Project is no longer active" });
        }

        if (project.owner_id === user_id) {
            return res.status(400).json({ error: "Cannot swipe on project owner" });
        }

        // Check if project owner already swiped on this user
        const { data: existingSwipe, error: checkError } = await supabase
            .from("swipes")
            .select("id")
            .eq("swiper_id", project.owner_id)
            .eq("target_user_id", user_id)
            .single();

        if (checkError && checkError.code !== "PGRST116") { // PGRST116 = no rows found
            throw checkError;
        }

        if (existingSwipe) {
            return res.status(409).json({ 
                error: "Project owner has already swiped on this user" 
            });
        }

        // Record the swipe (using project owner as swiper)
        const newSwipe = await recordSwipe(project.owner_id, user_id, direction, 'user');

        // Check for match if it's a like
        let matchResult = false;
        if (direction === 'like') {
            matchResult = await detectMatch(project.owner_id, user_id, 'user');
        }

        const response = {
            success: true,
            swipe: newSwipe,
            message: direction === "like" ? "User liked!" : "User passed"
        };

        if (matchResult) {
            response.match = true;
            response.user_id = user_id;
            response.project_id = project_id;
        }

        res.json(response);

    } catch (error) {
        console.error("Error recording user swipe:", error);
        res.status(500).json({ error: "Failed to record swipe" });
    }
}

// Controller for getting all matches for a user
export async function getMatchesController(req, res) {
    try {
        const { userId } = req.query;
        
        if (!userId) {
            return res.status(400).json({ error: "userId query parameter is required" });
        }

        if (!validateUUID(userId)) {
            return res.status(400).json({ error: "Invalid user ID format" });
        }

        // Get all matches where the user is involved
        // This includes both user->project matches and project->user matches
        const { data: userProjectMatches, error: userProjectError } = await supabase
            .from("swipes")
            .select(`
                id,
                direction,
                created_at,
                projects!swipes_target_project_id_fkey(
                    id,
                    title,
                    description,
                    tags,
                    looking_for,
                    is_active,
                    created_at,
                    owner_id,
                    users!projects_owner_id_fkey(username, role, experience)
                )
            `)
            .eq("swiper_id", userId)
            .eq("direction", "like")
            .not("target_project_id", "is", null);

        if (userProjectError) throw userProjectError;

        // Get matches where users liked this user's projects
        const { data: projectUserMatches, error: projectUserError } = await supabase
            .from("swipes")
            .select(`
                id,
                direction,
                created_at,
                users!swipes_swiper_id_fkey(
                    id,
                    username,
                    role,
                    experience,
                    time_commitment,
                    tech_tags
                ),
                projects!swipes_target_project_id_fkey(
                    id,
                    title,
                    description,
                    tags,
                    looking_for,
                    is_active,
                    created_at,
                    owner_id
                )
            `)
            .eq("target_user_id", userId)
            .eq("direction", "like")
            .not("target_user_id", "is", null);

        if (projectUserError) throw projectUserError;

        // Filter for actual matches (mutual likes)
        const matches = [];

        // Check user->project matches
        for (const userSwipe of userProjectMatches) {
            if (!userSwipe.projects) continue;
            
            // Check if project owner also liked this user
            const { data: ownerSwipe, error: ownerSwipeError } = await supabase
                .from("swipes")
                .select("id")
                .eq("swiper_id", userSwipe.projects.owner_id)
                .eq("target_user_id", userId)
                .eq("direction", "like")
                .single();

            if (ownerSwipeError && ownerSwipeError.code !== "PGRST116") throw ownerSwipeError;

            if (ownerSwipe) {
                matches.push({
                    type: "user_to_project",
                    match_id: `${userId}_${userSwipe.projects.id}`,
                    user_swipe: userSwipe,
                    project: userSwipe.projects,
                    matched_at: userSwipe.created_at
                });
            }
        }

        // Check project->user matches
        for (const projectSwipe of projectUserMatches) {
            if (!projectSwipe.users || !projectSwipe.projects) continue;
            
            // Check if user also liked this project
            const { data: userSwipe, error: userSwipeError } = await supabase
                .from("swipes")
                .select("id")
                .eq("swiper_id", userId)
                .eq("target_project_id", projectSwipe.projects.id)
                .eq("direction", "like")
                .single();

            if (userSwipeError && userSwipeError.code !== "PGRST116") throw userSwipeError;

            if (userSwipe) {
                matches.push({
                    type: "project_to_user",
                    match_id: `${userId}_${projectSwipe.projects.id}`,
                    project_swipe: projectSwipe,
                    user: projectSwipe.users,
                    project: projectSwipe.projects,
                    matched_at: projectSwipe.created_at
                });
            }
        }

        // Remove duplicates and sort by match date
        const uniqueMatches = matches.filter((match, index, arr) => 
            arr.findIndex(m => m.match_id === match.match_id) === index
        ).sort((a, b) => new Date(b.matched_at) - new Date(a.matched_at));

        res.json({
            matches: uniqueMatches,
            count: uniqueMatches.length
        });

    } catch (error) {
        console.error("Error fetching matches:", error);
        res.status(500).json({ error: "Failed to fetch matches" });
    }
}

// Controller for swipes table health check
export async function swipesHealthController(req, res) {
    try {
        // Simple query to confirm swipes table responds
        const { data, error } = await supabase.from("swipes").select("count").limit(1);
        if (error) throw error;
        
        res.json({ 
            ok: true, 
            table: "swipes", 
            status: "healthy",
            timestamp: new Date().toISOString()
        });
    } catch (e) {
        res.status(500).json({ 
            ok: false, 
            table: "swipes", 
            error: e.message,
            timestamp: new Date().toISOString()
        });
    }
}


// Debug controller to clear swipes for testing
export async function clearSwipesController(req, res) {
    try {
        const { userId } = req.params;
        
        const { error } = await supabase
            .from("swipes")
            .delete()
            .eq("swiper_id", userId);
        
        if (error) throw error;
        
        res.json({
            success: true,
            message: `Cleared all swipes for user ${userId}`
        });
        
    } catch (error) {
        console.error("Clear swipes error:", error);
        res.status(500).json({ error: error.message });
    }
}

// Debug controller to see all users
export async function debugUsersController(req, res) {
    try {
        const { data: users, error } = await supabase
            .from("users")
            .select("id, username, role, experience, email")
            .limit(10);

        if (error) throw error;

        res.json({
            totalUsers: users.length,
            users: users
        });

    } catch (error) {
        console.error("Debug users error:", error);
        res.status(500).json({ error: error.message });
    }
}

// Debug controller to create test applications
export async function createTestApplicationsController(req, res) {
    try {
        const { projectId } = req.params;
        
        // Get some users to create applications
        const { data: users, error: usersError } = await supabase
            .from("users")
            .select("id")
            .limit(3);

        if (usersError) throw usersError;

        if (users.length === 0) {
            return res.status(400).json({ error: "No users found to create applications" });
        }

        // Create applications for the project
        const applications = users.map(user => ({
            user_id: user.id,
            project_id: projectId,
            blurb: "I'm interested in joining this project!",
            status: "pending"
        }));

        const { data, error } = await supabase
            .from("applications")
            .insert(applications);

        if (error) throw error;

        res.json({
            success: true,
            message: `Created ${applications.length} test applications for project ${projectId}`,
            applications: applications
        });

    } catch (error) {
        console.error("Create test applications error:", error);
        res.status(500).json({ error: error.message });
    }
}
