-- Database schema for users
create table if not exists users (
  id uuid primary key default gen_random_uuid(),      -- unique identifier for each user
  email text unique not null,                         -- user's email address (used for login / contact)
  username text unique,                               -- display name or handle
  role text,                                          -- user's main role (e.g. "frontend", "backend", "mobile", "designer")
  experience text,                                    -- skill level ("beginner", "intermediate", "advanced")
  time_commitment text,                               -- how much time they can contribute (e.g. "5 hrs/week")
  socials jsonb,                                      -- links to socials (e.g. { "discord": "", "linkedin": "" })
  tech_tags text[] default '{}',                      -- list of technologies they use (e.g. ["react","nodejs","python"])
  created_at timestamptz default now()                -- timestamp when the user joined
);

-- Database schema for projects
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),           -- unique identifier for the project
  owner_id uuid references users(id) on delete cascade,    -- user who created the project
  title text not null,                                     -- name of the project
  description text,                                        -- detailed description of the project
  tags text[] default '{}',                                -- general topic/keywords (e.g. ["ai","mobile","web"])
  looking_for text[] default '{}',                         -- roles they’re recruiting for (e.g. ["frontend","backend"])
  is_active boolean default true,                          -- whether the project is still open for new members
  created_at timestamptz default now()                     -- timestamp when the project was created
);

-- Database schema for applications
create table if not exists applications (
  id uuid primary key default gen_random_uuid(),             -- unique identifier for each application
  project_id uuid references projects(id) on delete cascade, -- project being applied to
  applicant_id uuid references users(id) on delete cascade,  -- user who submitted the application
  blurb text,                                                -- short message/introduction from the applicant
  created_at timestamptz default now(),                      -- when the application was submitted
  unique (project_id, applicant_id)                          -- prevents duplicate applications to the same project
);

-- Database schema for swipes (like/pass actions)
create table if not exists swipes (
  id uuid primary key default gen_random_uuid(),               -- unique identifier for each swipe action
  swiper_id uuid references users(id) on delete cascade,       -- user performing the swipe
  target_user_id uuid references users(id),                    -- optional: when swiping on a user (for recruiting)
  target_project_id uuid references projects(id),              -- optional: when swiping on a project (for joining)
  direction text check (direction in ('like','pass')),         -- whether the user liked or passed
  created_at timestamptz default now(),                        -- timestamp of the swipe
  constraint one_target check (                                -- ensures a swipe has *either* a user or project target
    (target_user_id is not null)::int + (target_project_id is not null)::int = 1
  )
);
