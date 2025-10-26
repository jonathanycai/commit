-- ===========================
-- USERS
-- ===========================
create table if not exists users (
  id uuid primary key default gen_random_uuid(),          -- unique identifier for each user (matches Supabase Auth ID)
  email text unique not null,                             -- user's email address (used for login / contact)
  username text unique,                                   -- display name or handle shown on the platform
  role text,                                              -- user's main role (e.g., "frontend", "backend", "designer")
  experience text,                                        -- skill level ("beginner", "intermediate", "advanced")
  time_commitment text,                                   -- how much time they can contribute (e.g., "5 hrs/week")
  socials jsonb,                                          -- links to socials (e.g., { "discord": "", "linkedin": "" })
  tech_tags text[] default '{}',                          -- list of technologies they use (e.g., ["react","nodejs"])
  created_at timestamptz default now()                    -- timestamp of when the user profile was created
);

-- ===========================
-- PROJECTS
-- ===========================
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),          -- unique identifier for each project
  owner_id uuid references users(id) on delete cascade,   -- user who created the project
  title text not null,                                    -- project name                                      -- project link/URL
  description text,                                       -- short or detailed description of the project
  tags text[] default '{}',                               -- project tech stack or general keywords
  looking_for text[] default '{}',                        -- roles they're recruiting for (e.g., ["frontend","ml"])
  is_active boolean default true,                         -- marks if project is still open for new members
  created_at timestamptz default now()                    -- timestamp when project was created
);

-- ===========================
-- APPLICATIONS
-- ===========================
create table if not exists applications (
  id uuid primary key default gen_random_uuid(),          -- unique identifier for each join request
  project_id uuid references projects(id) on delete cascade, -- project being applied to
  user_id uuid references users(id) on delete cascade,    -- user who submitted the application
  blurb text,                                             -- short message or intro written by the applicant
  status text default 'pending',                          -- current state: "pending", "accepted", or "rejected"
  created_at timestamptz default now(),                   -- timestamp when the application was submitted
  unique (project_id, user_id)                            -- prevents duplicate applications to the same project
);

-- ===========================
-- SWIPES
-- ===========================
create table if not exists swipes (
  id uuid primary key default gen_random_uuid(),          -- unique identifier for each swipe
  swiper_id uuid references users(id) on delete cascade,  -- user performing the swipe
  target_user_id uuid references users(id),               -- optional: user being swiped on (for project owners)
  target_project_id uuid references projects(id),         -- optional: project being swiped on (for regular users)
  direction text check (direction in ('like','pass')),    -- whether the user liked or passed
  created_at timestamptz default now(),                   -- timestamp of when the swipe happened
  constraint one_target check (                           -- ensures only one of user or project target is used
    (target_user_id is not null)::int + (target_project_id is not null)::int = 1
  )
);

-- ===========================
-- NOTIFICATIONS
-- ===========================
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),          -- unique identifier for each notification
  receiver_id uuid references users(id) on delete cascade,-- who receives the notification
  sender_id uuid references users(id),                    -- who triggered the notification
  project_id uuid references projects(id),                -- which project this notification relates to
  type text,                                              -- type of notification ("request", "approval", etc.)
  message text,                                           -- message shown in the notification
  is_read boolean default false,                          -- whether the notification has been viewed
  created_at timestamptz default now()                    -- timestamp of when the notification was created
);
