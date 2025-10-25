import "dotenv/config";
import express from "express";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(express.json());

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// health check
app.get("/health", async (_req, res) => {
    const { data, error } = await supabase.from("users").select("count").limit(1);
    if (error) return res.status(500).json({ ok: false, error: error.message });
    res.json({ ok: true, db: true });
});

app.listen(process.env.PORT || 4000, () =>
    console.log(`running on http://localhost:${process.env.PORT || 4000}`)
);
