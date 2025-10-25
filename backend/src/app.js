import "dotenv/config";
import express from "express";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(express.json());

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// checks if DB connection works
app.get("/health", async (_req, res) => {
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
app.get("/health/users", async (_req, res) => {
    try {
        const { error } = await supabase.from("users").select("id").limit(1);
        if (error) throw error;
        res.json({ table: "users", ok: true });
    } catch (e) {
        res.status(500).json({ table: "users", ok: false, error: e.message });
    }
});

// projects table check
app.get("/health/projects", async (_req, res) => {
    try {
        const { error } = await supabase.from("projects").select("id").limit(1);
        if (error) throw error;
        res.json({ table: "projects", ok: true });
    } catch (e) {
        res.status(500).json({ table: "projects", ok: false, error: e.message });
    }
});

// applications table check
app.get("/health/applications", async (_req, res) => {
    try {
        const { error } = await supabase.from("applications").select("id").limit(1);
        if (error) throw error;
        res.json({ table: "applications", ok: true });
    } catch (e) {
        res.status(500).json({ table: "applications", ok: false, error: e.message });
    }
});

// swipes table check
app.get("/health/swipes", async (_req, res) => {
    try {
        const { error } = await supabase.from("swipes").select("id").limit(1);
        if (error) throw error;
        res.json({ table: "swipes", ok: true });
    } catch (e) {
        res.status(500).json({ table: "swipes", ok: false, error: e.message });
    }
});


app.listen(process.env.PORT || 4000, () =>
    console.log(`running on http://localhost:${process.env.PORT || 4000}`)
);
