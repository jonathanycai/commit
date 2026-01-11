# Frontend-Backend Integration Guide

## Overview
The frontend and backend authentication systems are now fully connected. Users can register, login, and complete their profile through the integrated flow.

## Features Implemented

### ✅ Authentication Integration
- **API Service Layer**: Centralized API calls with proper error handling
- **Authentication Context**: React context for managing user state across the app
- **Login Flow**: Email/password authentication with backend validation
- **Registration Flow**: User account creation with profile completion
- **Profile Creation**: User profile data stored in Supabase via backend API

### ✅ User Experience
- **Loading States**: Visual feedback during API calls
- **Error Handling**: User-friendly error messages
- **Form Validation**: Client-side validation with Zod schemas
- **Responsive Design**: Maintains existing UI/UX design

## How to Run

### Backend (Port 4000)
```bash
cd backend
npm install
npm start
```

### Frontend (Port 8080)
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints Used

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Session hydration (reads HttpOnly cookie)
- `GET /auth/csrf` - Issues CSRF cookie (double-submit token)
- `POST /auth/logout` - Clears auth cookies
- `POST /auth/check-password` - Password strength validation

### User Profile
- `POST /users` - Create user profile
- `GET /users/profile` - Get current user profile
- `GET /users/:id` - Get user profile by ID

## Environment Configuration

### Local dev
- Frontend uses a Vite dev-server proxy: requests to `/api/*` are forwarded to `http://localhost:4000/*`.
- This makes requests **same-origin** in the browser, so cookies work over HTTP in dev.

### Preview/Production
- Set `VITE_API_URL` in Vercel to your Render backend URL (set separately for **Preview** vs **Production** in Vercel env vars).
- On the backend, set `FRONTEND_ORIGIN` to your production Vercel domain.
- On backend preview environments, set `ALLOW_PREVIEW_ORIGINS=true` so `*.vercel.app` is accepted.

## User Flow

1. **Registration**: User enters email/password → Account created → Redirected to profile setup
2. **Profile Setup**: User completes profile information → Profile saved to database
3. **Login**: User enters credentials → Authenticated → Redirected to home page

## Security Features

- **Password Validation**: Backend validates password strength
- **Rate Limiting**: API calls are rate-limited to prevent abuse
- **Token Management**: JWT stored in **HttpOnly cookies** (not readable by JavaScript)
- **Authentication Guards**: Protected routes require authentication
- **CORS**: Dynamic origin validation with `credentials: true` (no wildcard)
- **CSRF**: Double-submit token (`csrf` cookie + `X-CSRF-Token` header) for write requests

## Next Steps

The authentication system is now fully functional. You can:
1. Test the registration and login flows
2. Add protected routes that require authentication
3. Implement logout functionality
4. Add password reset features
5. Integrate with other parts of your application
