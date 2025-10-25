# Swipe API Documentation

This document describes the API endpoints for the Tinder-like swiping functionality for projects and users.

## Base URL
```
http://localhost:4000
```

## New API Endpoints (Recommended)

### 1️⃣ User → Project Swiping

#### GET `/swipes/next-project`
Pull a random project the user hasn't swiped on yet.

**Query Parameters:**
- `userId` (required): UUID of the user requesting projects

**Response:**
```json
{
  "id": "uuid",
  "title": "Project Name",
  "description": "Project description",
  "tags": ["react", "nodejs"],
  "looking_for": ["frontend", "backend"],
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z",
  "owner_id": "uuid",
  "users": {
    "username": "owner_username",
    "role": "backend",
    "experience": "intermediate"
  }
}
```

**No More Projects Response:**
```json
{
  "message": "No more projects available."
}
```

#### POST `/swipes/project`
Record user's swipe action (like or pass) on a project.

**Request Body:**
```json
{
  "project_id": "uuid",
  "direction": "like", // or "pass"
  "userId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "swipe": {
    "id": "uuid",
    "swiper_id": "uuid",
    "target_project_id": "uuid",
    "direction": "like",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "message": "Project liked!",
  "match": true, // only present if match found
  "project_id": "uuid" // only present if match found
}
```

### 2️⃣ Project → User Swiping

#### GET `/swipes/next-user`
Pull a random user for project swiping (users who have applied to or liked the project).

**Query Parameters:**
- `projectId` (required): UUID of the project

**Response:**
```json
{
  "id": "uuid",
  "username": "user_username",
  "role": "frontend",
  "experience": "intermediate",
  "time_commitment": "5 hrs/week",
  "tech_tags": ["react", "typescript"]
}
```

**No More Users Response:**
```json
{
  "message": "No more users available."
}
```

#### POST `/swipes/user`
Record project owner's swipe action on a user.

**Request Body:**
```json
{
  "user_id": "uuid",
  "project_id": "uuid",
  "direction": "like" // or "pass"
}
```

**Response:**
```json
{
  "success": true,
  "swipe": {
    "id": "uuid",
    "swiper_id": "uuid", // project owner's ID
    "target_user_id": "uuid",
    "direction": "like",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "message": "User liked!",
  "match": true, // only present if match found
  "user_id": "uuid", // only present if match found
  "project_id": "uuid" // only present if match found
}
```

### 3️⃣ Utility Endpoints

#### GET `/swipes/matches`
List all mutual likes (matches) for the current user.

**Query Parameters:**
- `userId` (required): UUID of the user

**Response:**
```json
{
  "matches": [
    {
      "type": "user_to_project",
      "match_id": "user_id_project_id",
      "user_swipe": {
        "id": "uuid",
        "direction": "like",
        "created_at": "2024-01-01T00:00:00Z"
      },
      "project": {
        "id": "uuid",
        "title": "Project Name",
        "description": "Project description",
        "tags": ["react", "nodejs"],
        "looking_for": ["frontend"],
        "is_active": true,
        "created_at": "2024-01-01T00:00:00Z",
        "owner_id": "uuid",
        "users": {
          "username": "owner_username",
          "role": "backend",
          "experience": "intermediate"
        }
      },
      "matched_at": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 1
}
```

#### GET `/swipes/health`
Simple status check for the swipes table.

**Response:**
```json
{
  "ok": true,
  "table": "swipes",
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Legacy Endpoints (Backward Compatibility)

### Get User's Saved Projects
**GET** `/api/swipe/saved/:userId`

### Remove Project from Saved
**DELETE** `/api/swipe/saved/:userId/:projectId`

### Get Swipe Statistics
**GET** `/api/swipe/stats/:userId`

## Error Responses

All endpoints return appropriate HTTP status codes:

- `400`: Bad Request (missing fields, invalid format, validation errors)
- `404`: Not Found (project/user doesn't exist)
- `409`: Conflict (already swiped)
- `500`: Internal Server Error

## Usage Examples

### Frontend Integration Example

```javascript
// Get next project to swipe on
const getNextProject = async (userId) => {
  const response = await fetch(`/swipes/next-project?userId=${userId}`);
  const data = await response.json();
  return data;
};

// Record a project swipe
const recordProjectSwipe = async (userId, projectId, direction) => {
  const response = await fetch('/swipes/project', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      project_id: projectId,
      direction
    })
  });
  return response.json();
};

// Get next user for project swiping
const getNextUser = async (projectId) => {
  const response = await fetch(`/swipes/next-user?projectId=${projectId}`);
  const data = await response.json();
  return data;
};

// Record a user swipe
const recordUserSwipe = async (userId, projectId, direction) => {
  const response = await fetch('/swipes/user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: userId,
      project_id: projectId,
      direction
    })
  });
  return response.json();
};

// Get all matches for a user
const getMatches = async (userId) => {
  const response = await fetch(`/swipes/matches?userId=${userId}`);
  const data = await response.json();
  return data;
};

// Check swipes table health
const checkSwipesHealth = async () => {
  const response = await fetch('/swipes/health');
  const data = await response.json();
  return data;
};
```

## Features Implemented

✅ **User → Project Swiping**: Complete workflow for users to discover and swipe on projects
✅ **Project → User Swiping**: Complete workflow for project owners to swipe on users
✅ **Match Detection**: Automatic detection of mutual likes
✅ **Random Selection**: Smart random selection excluding already swiped targets
✅ **No More Targets Handling**: Graceful handling when no targets remain
✅ **Comprehensive Validation**: Input validation and error handling
✅ **Duplicate Prevention**: Users can't swipe twice on same target
✅ **Own Target Filtering**: Users can't swipe on their own projects
✅ **Active Filtering**: Only active projects are shown
✅ **Legacy Support**: Backward compatibility with existing endpoints

## Database Schema

The swiping functionality uses the existing `swipes` table:

```sql
create table if not exists swipes (
  id uuid primary key default gen_random_uuid(),
  swiper_id uuid references users(id) on delete cascade,
  target_user_id uuid references users(id),
  target_project_id uuid references projects(id),
  direction text check (direction in ('like','pass')),
  created_at timestamptz default now(),
  constraint one_target check (
    (target_user_id is not null)::int + (target_project_id is not null)::int = 1
  )
);
```

## Helper Functions

The API includes several helper functions:

- `getRandomProject(userId)` → Returns a random project the user hasn't swiped on
- `getRandomUser(projectId)` → Returns a random eligible user for the project
- `recordSwipe(swiperId, targetId, direction, targetType)` → Records a swipe action
- `detectMatch(swiperId, targetId, targetType)` → Checks for mutual likes
- `noMoreTargetsMessage()` → Returns standardized "no more targets" message

## Next Steps

1. Test the new endpoints using the provided examples
2. Update frontend to use the new API structure
3. Add authentication middleware if needed
4. Consider adding pagination for large lists
5. Add real-time notifications for matches
6. Implement tag-based filtering for future enhancements