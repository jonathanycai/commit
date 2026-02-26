import express from "express";
import { supabaseAdmin as supabase } from "../lib/supabase.js";
import { requireAuth } from "../middleware/auth.js";
import { addClient, removeClient, broadcastToUser } from "../lib/notificationsHub.js";

const router = express.Router();

/**
 * 🔴 SSE stream – push realtime notification events to the logged-in user.
 * Uses fetch()-based SSE on the client (EventSource can't send Auth headers).
 */
router.get("/stream", requireAuth, (req, res) => {
    const userId = req.user.id;

    // SSE headers
    res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no", // prevent Render/nginx proxy buffering
    });

    // Initial connection confirmation
    res.write(`data: ${JSON.stringify({ type: "connected" })}\n\n`);

    // Keep-alive ping every 25 s so proxies don't drop the connection
    const keepAlive = setInterval(() => {
        try {
            res.write(`data: ${JSON.stringify({ type: "ping" })}\n\n`);
        } catch {
            clearInterval(keepAlive);
        }
    }, 25_000);

    addClient(userId, res);

    req.on("close", () => {
        clearInterval(keepAlive);
        removeClient(userId, res);
    });
});

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

        // Push realtime event to the receiver
        broadcastToUser(receiver_id, { type: "notification_created" });

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
