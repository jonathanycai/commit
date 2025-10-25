import { supabase } from "../lib/supabase.js";

// Helper function to get a random project for user swiping
export async function getRandomProject(userId) {
    try {
        // Get projects that the user hasn't swiped on yet
        const { data: projects, error: projectsError } = await supabase
            .from("projects")
            .select(`
                id,
                title,
                description,
                tags,
                looking_for,
                is_active,
                created_at,
                owner_id,
                users!projects_owner_id_fkey(username, role, experience)
            `)
            .eq("is_active", true)
            .not("owner_id", "eq", userId); // Don't show user's own projects

        if (projectsError) throw projectsError;

        // Get projects the user has already swiped on
        const { data: swipedProjects, error: swipedError } = await supabase
            .from("swipes")
            .select("target_project_id")
            .eq("swiper_id", userId)
            .not("target_project_id", "is", null);

        if (swipedError) throw swipedError;

        // Filter out already swiped projects
        const swipedProjectIds = swipedProjects.map(swipe => swipe.target_project_id);
        const availableProjects = projects.filter(project => 
            !swipedProjectIds.includes(project.id)
        );

        // Return random project or null if none available
        if (availableProjects.length === 0) {
            return null;
        }

        const randomIndex = Math.floor(Math.random() * availableProjects.length);
        return availableProjects[randomIndex];
    } catch (error) {
        console.error("Error in getRandomProject:", error);
        throw error;
    }
}

// Helper function to get a random user for project swiping
export async function getRandomUser(projectId) {
    try {
        // Get project details first
        const { data: project, error: projectError } = await supabase
            .from("projects")
            .select("id, owner_id")
            .eq("id", projectId)
            .single();

        if (projectError) throw projectError;
        if (!project) return null;

        // Get users who have applied to or liked the project
        const { data: applications, error: applicationsError } = await supabase
            .from("applications")
            .select("user_id")
            .eq("project_id", projectId);
            // Remove the status filter to include all applications

        if (applicationsError) throw applicationsError;

        // Get users who have liked this project
        const { data: likedUsers, error: likedError } = await supabase
            .from("swipes")
            .select("swiper_id")
            .eq("target_project_id", projectId)
            .eq("direction", "like");

        if (likedError) throw likedError;

        // Combine user IDs from applications and likes
        const candidateUserIds = [
            ...applications.map(app => app.user_id),
            ...likedUsers.map(swipe => swipe.swiper_id)
        ].filter((id, index, arr) => arr.indexOf(id) === index); // Remove duplicates

        if (candidateUserIds.length === 0) return null;

        // Get users who have already been swiped on by this project owner
        const { data: swipedUsers, error: swipedError } = await supabase
            .from("swipes")
            .select("target_user_id")
            .eq("swiper_id", project.owner_id)
            .not("target_user_id", "is", null);

        if (swipedError) throw swipedError;

        const swipedUserIds = swipedUsers.map(swipe => swipe.target_user_id);

        // Filter out already swiped users and project owner
        const eligibleUserIds = candidateUserIds.filter(userId => 
            userId !== project.owner_id && !swipedUserIds.includes(userId)
        );

        if (eligibleUserIds.length === 0) return null;

        // Get random eligible user
        const randomUserId = eligibleUserIds[Math.floor(Math.random() * eligibleUserIds.length)];
        
        const { data: user, error: userError } = await supabase
            .from("users")
            .select("id, username, role, experience, time_commitment, tech_tags")
            .eq("id", randomUserId)
            .single();

        if (userError) throw userError;
        return user;
    } catch (error) {
        console.error("Error in getRandomUser:", error);
        throw error;
    }
}

// Helper function to record a swipe
export async function recordSwipe(swiperId, targetId, direction, targetType) {
    try {
        const swipeData = {
            swiper_id: swiperId,
            direction: direction
        };

        if (targetType === 'project') {
            swipeData.target_project_id = targetId;
        } else if (targetType === 'user') {
            swipeData.target_user_id = targetId;
        }

        const { data: newSwipe, error: swipeError } = await supabase
            .from("swipes")
            .insert(swipeData)
            .select()
            .single();

        if (swipeError) throw swipeError;
        return newSwipe;
    } catch (error) {
        console.error("Error in recordSwipe:", error);
        throw error;
    }
}

// Helper function to detect matches
export async function detectMatch(swiperId, targetId, targetType) {
    try {
        if (targetType === 'project') {
            // Check if project owner has liked this user back
            const { data: project, error: projectError } = await supabase
                .from("projects")
                .select("owner_id")
                .eq("id", targetId)
                .single();

            if (projectError) throw projectError;
            if (!project) return false;

            const { data: ownerSwipe, error: ownerSwipeError } = await supabase
                .from("swipes")
                .select("id")
                .eq("swiper_id", project.owner_id)
                .eq("target_user_id", swiperId)
                .eq("direction", "like")
                .single();

            if (ownerSwipeError && ownerSwipeError.code !== "PGRST116") throw ownerSwipeError;
            return !!ownerSwipe;

        } else if (targetType === 'user') {
            // Check if user has liked this project back
            const { data: userSwipe, error: userSwipeError } = await supabase
                .from("swipes")
                .select("id")
                .eq("swiper_id", targetId)
                .eq("target_project_id", swiperId)
                .eq("direction", "like")
                .single();

            if (userSwipeError && userSwipeError.code !== "PGRST116") throw userSwipeError;
            return !!userSwipe;
        }

        return false;
    } catch (error) {
        console.error("Error in detectMatch:", error);
        throw error;
    }
}

// Helper function to return standardized "no more targets" message
export function noMoreTargetsMessage() {
    return { 
        done: true, 
        message: "No more active targets." 
    };
}

// Helper function to validate UUID format
export function validateUUID(id) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
}
