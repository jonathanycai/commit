import express from "express";
import { createClient } from "@supabase/supabase-js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Create a new notification
router.post("/", requireAuth, async (req, res) => {
    try {
        const { receiver_id, project_id, type, message } = req.body;
        const sender_id = req.user.id; // current logged-in user

        // Validate input
        if (!receiver_id || !project_id || !type || !message) {
            return res.status(400).json({
                error: "receiver_id, project_id, type, and message are required",
            });
        }

        // Insert new notification
        const { data, error } = await supabase
            .from("notifications")
            .insert([
                {
                    receiver_id,
                    sender_id,
                    project_id,
                    type,
                    message,
                },
            ])
            .select(
                `
        id,
        receiver_id,
        sender_id,
        project_id,
        type,
        message,
        is_read,
        created_at,
        users!notifications_sender_id_fkey (
          id,
          username,
          email
        )
      `
            )
            .single();

        if (error) throw error;

        res.status(201).json({
            message: "Notification created successfully",
            notification: data,
        });
    } catch (err) {
        console.error("Error creating notification:", err.message);
        res.status(500).json({ error: "Failed to create notification" });
    }
});

export default router;
