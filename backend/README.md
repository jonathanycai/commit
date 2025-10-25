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

### Development Mode

For development with auto-reload on file changes:

```bash
npm run dev
```