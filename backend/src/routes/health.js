import express from "express";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// General health check
router.get("/", async (_req, res) => {
    try {
        // simple query to confirm DB responds
        const { data, error } = await supabase.from("users").select("count").limit(1);
        if (error) throw error;
        res.json({ ok: true, db: "connected" });
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
});

// users table check
router.get("/users", async (_req, res) => {
    try {
        const { error } = await supabase.from("users").select("id").limit(1);
        if (error) throw error;
        res.json({ table: "users", ok: true });
    } catch (e) {
        res.status(500).json({ table: "users", ok: false, error: e.message });
    }
});

// projects table check
router.get("/projects", async (_req, res) => {
    try {
        const { error } = await supabase.from("projects").select("id").limit(1);
        if (error) throw error;
        res.json({ table: "projects", ok: true });
    } catch (e) {
        res.status(500).json({ table: "projects", ok: false, error: e.message });
    }
});

// applications table check
router.get("/applications", async (_req, res) => {
    try {
        const { error } = await supabase.from("applications").select("id").limit(1);
        if (error) throw error;
        res.json({ table: "applications", ok: true });
    } catch (e) {
        res.status(500).json({ table: "applications", ok: false, error: e.message });
    }
});

// swipes table check
router.get("/swipes", async (_req, res) => {
    try {
        const { error } = await supabase.from("swipes").select("id").limit(1);
        if (error) throw error;
        res.json({ table: "swipes", ok: true });
    } catch (e) {
        res.status(500).json({ table: "swipes", ok: false, error: e.message });
    }
});

export default router;
