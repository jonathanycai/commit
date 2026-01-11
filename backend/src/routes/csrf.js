import express from "express";
import crypto from "crypto";

const router = express.Router();

router.get("/csrf-token", (req, res) => {
    const csrfToken = crypto.randomBytes(32).toString("hex");
    const isProd = process.env.NODE_ENV === "production";

    res.cookie("csrfToken", csrfToken, {
        httpOnly: false,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        path: "/",
    });

    res.json({ csrfToken });
});

export default router;
