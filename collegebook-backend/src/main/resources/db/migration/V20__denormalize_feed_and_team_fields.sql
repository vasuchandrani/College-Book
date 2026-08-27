-- Migration V20: Add denormalized snapshot fields to posts and teams for O(1) feed reads

-- 1. Add snapshot fields to posts
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS author_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS author_handle VARCHAR(100),
ADD COLUMN IF NOT EXISTS author_avatar_url TEXT,
ADD COLUMN IF NOT EXISTS author_initials VARCHAR(10),
ADD COLUMN IF NOT EXISTS author_course VARCHAR(255),
ADD COLUMN IF NOT EXISTS author_department VARCHAR(255),
ADD COLUMN IF NOT EXISTS college_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS college_short_name VARCHAR(50);

-- 2. Add snapshot fields to teams
ALTER TABLE teams
ADD COLUMN IF NOT EXISTS owner_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS owner_handle VARCHAR(100),
ADD COLUMN IF NOT EXISTS owner_avatar_url TEXT,
ADD COLUMN IF NOT EXISTS college_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS college_short_name VARCHAR(50);

-- 3. Backfill posts with existing author and college details
UPDATE posts p
SET 
  author_name = COALESCE(src.full_name, src.email),
  author_handle = src.handle,
  author_avatar_url = src.avatar_url,
  author_initials = COALESCE(src.initials, 'U'),
  author_course = COALESCE(src.course_name, 'Student'),
  author_department = src.dept_name,
  college_name = src.college_name,
  college_short_name = src.college_short_name
FROM (
  SELECT 
    pst.id AS post_id,
    u.email,
    pr.full_name,
    pr.handle,
    pr.avatar_url,
    pr.initials,
    c.name AS course_name,
    d.name AS dept_name,
    col.name AS college_name,
    col.short_name AS college_short_name
  FROM posts pst
  JOIN users u ON pst.author_id = u.id
  LEFT JOIN profiles pr ON u.id = pr.user_id
  LEFT JOIN courses c ON pr.course_id = c.id
  LEFT JOIN departments d ON pr.department_id = d.id
  LEFT JOIN colleges col ON COALESCE(pst.college_id, u.college_id) = col.id
) src
WHERE p.id = src.post_id;

-- 4. Backfill teams with existing owner and college details
UPDATE teams t
SET
  owner_name = COALESCE(src.full_name, src.email),
  owner_handle = src.handle,
  owner_avatar_url = src.avatar_url,
  college_name = src.college_name,
  college_short_name = src.college_short_name
FROM (
  SELECT 
    tm.id AS team_id,
    u.email,
    pr.full_name,
    pr.handle,
    pr.avatar_url,
    col.name AS college_name,
    col.short_name AS college_short_name
  FROM teams tm
  JOIN users u ON tm.lead_id = u.id
  LEFT JOIN profiles pr ON u.id = pr.user_id
  LEFT JOIN colleges col ON COALESCE(tm.college_id, u.college_id) = col.id
) src
WHERE t.id = src.team_id;

