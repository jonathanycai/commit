import express from "express";
import { supabase } from "../lib/supabase.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

/**
 * 📨 Create a new notification
 * Body: { receiver_id, project_id, type }
 */
router.post("/", requireAuth, async (req, res) => {
    try {
        const { receiver_id, project_id, type } = req.body;
        const sender_id = req.user.id; // current logged-in user

        if (!receiver_id || !project_id || !type) {
            return res.status(400).json({
                error: "receiver_id, project_id, and type are required",
            });
        }

        const { data, error } = await supabase
            .from("notifications")
            .insert({
                receiver_id,
                sender_id,
                project_id,
                type,
                message: "", // optional placeholder message
            })
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

/**
 * 📬 Get all notifications for the current user
 */
router.get("/", requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;

        const { data, error } = await supabase
            .from("notifications")
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
            .eq("receiver_id", userId)
            .order("created_at", { ascending: false });

        if (error) throw error;

        res.json({
            notifications: data,
            count: data.length,
        });
    } catch (err) {
        console.error("Error fetching notifications:", err.message);
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
});

export default router;
