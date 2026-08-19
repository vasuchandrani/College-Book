-- 1. Add OPEN_SOURCE to the team_kind enum
ALTER TYPE team_kind ADD VALUE IF NOT EXISTS 'OPEN_SOURCE';

-- 2. Fix max_members: V1 defined it as GENERATED ALWAYS which blocks Hibernate writes.
--    Drop the generated column and add a regular writable one.
ALTER TABLE teams DROP COLUMN IF EXISTS max_members;
ALTER TABLE teams ADD COLUMN max_members INTEGER NOT NULL DEFAULT 4;

-- 3. Add denormalized owner college name for efficient filtering
ALTER TABLE teams ADD COLUMN IF NOT EXISTS owner_college_name TEXT;

-- 4. Backfill owner_college_name from existing data
UPDATE teams t SET owner_college_name = c.name
FROM users u JOIN colleges c ON u.college_id = c.id
WHERE t.lead_id = u.id AND t.owner_college_name IS NULL;
