# Backend Folder Structure

```
backend/
├── .env                    # Environment variables (not tracked in git)
├── .gitignore              # Git ignore configuration
├── package.json            # Node.js dependencies and scripts
├── db/
│   └── schema.sql         # Database schema definition
└── src/
    └── app.js             # Main application entry point
```

## Getting Started

To run the backend server:

```bash
# Navigate to the backend directory
cd backend

# Install dependencies (first time only)
npm install

# Start the server
npm run start
```

The server will start on `http://localhost:4000`

## Auth + CORS Environment Variables

- `FRONTEND_ORIGIN` (production): the exact origin of your production frontend, e.g. `https://commit.example.com`
- `ALLOW_PREVIEW_ORIGINS` (preview): set to `true` to allow `*.vercel.app` (and `*.onrender.com`) origins
- `CORS_ALLOW_ORIGINS` (optional): comma-separated explicit origins to allow (useful for staging), e.g. `https://foo.vercel.app,https://bar.vercel.app`
- `APP_ENV` (optional): `local` | `preview` | `production` (defaults based on `NODE_ENV` + Render heuristics)
- `CSRF_ENABLED` (optional): set to `false` to disable CSRF protection (not recommended for `SameSite=None` setups)

### Development Mode

For development with auto-reload on file changes:

```bash
npm run dev
```