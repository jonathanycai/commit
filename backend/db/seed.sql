-- ===========================================
-- SEED DATA FOR PLATFORM TESTING
-- ===========================================

-- Clear existing data (for local testing only)
truncate table notifications, swipes, applications, projects, users restart identity cascade;

-- ===========================
-- USERS
-- ===========================
insert into users (id, email, username, role, experience, time_commitment, socials, tech_tags)
values
  (gen_random_uuid(), 'alice@example.com', 'alice', 'frontend', 'intermediate', '5 hrs/week', '{"discord": "alice#1234", "linkedin": "linkedin.com/in/alice"}', '{react,typescript,figma}'),
  (gen_random_uuid(), 'bob@example.com', 'bob', 'backend', 'advanced', '10 hrs/week', '{"discord": "bob#5678", "linkedin": "linkedin.com/in/bob"}', '{nodejs,express,postgresql}'),
  (gen_random_uuid(), 'charlie@example.com', 'charlie', 'mobile', 'beginner', '3 hrs/week', '{"discord": "charlie#0001", "linkedin": "linkedin.com/in/charlie"}', '{flutter,dart,firebase}'),
  (gen_random_uuid(), 'diana@example.com', 'diana', 'designer', 'intermediate', '6 hrs/week', '{"discord": "diana#3210", "linkedin": "linkedin.com/in/diana"}', '{figma,illustrator,ux}');

-- ===========================
-- PROJECTS
-- ===========================
insert into projects (id, owner_id, title, description, tags, looking_for, is_active)
select gen_random_uuid(), id, 'CampusConnect', 'App that helps students find study groups.', '{react,nodejs}', '{backend,designer}', true from users where username='alice'
union all
select gen_random_uuid(), id, 'FitTrack', 'Mobile fitness tracker using gamification.', '{flutter,aws}', '{frontend,backend}', true from users where username='charlie'
union all
select gen_random_uuid(), id, 'EcoMap', 'Web app for tracking sustainable shops.', '{vue,express}', '{designer,frontend}', true from users where username='bob';

-- ===========================
-- APPLICATIONS
-- ===========================
insert into applications (id, project_id, user_id, blurb, status)
select gen_random_uuid(), p.id, u.id, 'I love your idea and have experience in UX design.', 'pending'
from users u
join projects p on p.title='CampusConnect'
where u.username='diana'
union all
select gen_random_uuid(), p.id, u.id, 'I can help with backend API routes!', 'accepted'
from users u
join projects p on p.title='FitTrack'
where u.username='bob';

-- ===========================
-- SWIPES
-- ===========================
insert into swipes (id, swiper_id, target_project_id, direction)
select gen_random_uuid(), u.id, p.id, 'like'
from users u
join projects p on p.title='EcoMap'
where u.username='alice'
union all
select gen_random_uuid(), u.id, p.id, 'pass'
from users u
join projects p on p.title='FitTrack'
where u.username='diana';

insert into swipes (id, swiper_id, target_user_id, direction)
select gen_random_uuid(), u1.id, u2.id, 'like'
from users u1, users u2
where u1.username='bob' and u2.username='charlie';

-- ===========================
-- NOTIFICATIONS
-- ===========================
insert into notifications (id, receiver_id, sender_id, project_id, type, message)
select gen_random_uuid(), p.owner_id, a.user_id, p.id, 'request', 'New join request from ' || u.username || ' for your project "' || p.title || '"'
from applications a
join projects p on a.project_id = p.id
join users u on a.user_id = u.id
where a.status='pending';

-- ===========================
-- VIEW DATA CHECK
-- ===========================
-- Quickly check what’s been inserted:
select 'Users:' as section; select username, role, experience from users;
select 'Projects:' as section; select title, looking_for, owner_id from projects;
select 'Applications:' as section; select project_id, user_id, status from applications;
select 'Swipes:' as section; select swiper_id, target_project_id, direction from swipes;
select 'Notifications:' as section; select receiver_id, message from notifications;
