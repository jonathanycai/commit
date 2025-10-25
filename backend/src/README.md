# Backend Source Code

## API Endpoints

### Health Check

To verify the server is running correctly, you can test the health endpoint.

**With the backend running**, open a separate terminal and run:

```bash
curl http://localhost:4000/health
```

You should receive a response like:
```json
{
  "status": "ok",
  "timestamp": "2025-10-25T09:15:30.123Z"
}
```

This confirms the server is up and responding to requests.

## File Structure

- **`app.js`** - Main Express application with route definitions and middleware

## 🧩 Setting Up Feature Workspaces

Our backend is structured around **feature-based folders** inside the `src/` directory.
Each folder represents a major feature (e.g. users, projects, applications, swipes) and contains its own routes, helpers, and logic.

### 📁 Folder structure

```
backend/
├─ src/
│  ├─ users/
│  │  ├─ routes.js        # defines Express routes for user-related endpoints
│  │  ├─ helpers.js       # reusable utility functions (e.g., getUserById)
│  │  └─ controller.js    # business logic / DB operations
│  ├─ projects/
│  │  ├─ routes.js
│  │  ├─ helpers.js
│  │  └─ controller.js
│  ├─ applications/
│  └─ swipes/
│
│  └─ app.js              # main Express app, imports all route modules
└─ db/
   └─ schema.sql          # SQL definitions for Supabase tables
```

### 🚀 Adding a new feature

1. Create a new folder under `src/`
   Example:

   ```bash
   mkdir src/projects
   touch src/projects/routes.js src/projects/helpers.js src/projects/controller.js
   ```

2. Define routes in `routes.js`

   ```js
   import express from "express";
   import { supabase } from "../lib/supabase.js";
   export const projectRoutes = express.Router();

   projectRoutes.get("/", async (_req, res) => {
     const { data, error } = await supabase.from("projects").select("*");
     if (error) return res.status(400).json({ error: error.message });
     res.json(data);
   });
   ```

3. Import the new router in `src/app.js`

   ```js
   import { projectRoutes } from "./projects/routes.js";
   app.use("/projects", projectRoutes);
   ```

4. Restart your server:

   ```bash
   npm run start
   ```