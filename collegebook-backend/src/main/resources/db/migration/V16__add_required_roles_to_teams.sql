-- V16: Add required_roles column to teams table
ALTER TABLE teams ADD COLUMN IF NOT EXISTS required_roles text[] DEFAULT '{}';

-- Backfill from required_expertise if empty
UPDATE teams 
SET required_roles = required_expertise 
WHERE (required_roles IS NULL OR array_length(required_roles, 1) IS NULL)
  AND required_expertise IS NOT NULL AND array_length(required_expertise, 1) > 0;
