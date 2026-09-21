-- Flyway Migration V24__rename_departments_to_branches.sql
-- 1. Allow nulls for college_id, course_id, and department_id, and set existing ones to NULL to prepare for re-seed
ALTER TABLE users ALTER COLUMN college_id DROP NOT NULL;

-- Nullify references so we can clear tables cleanly
UPDATE users SET college_id = NULL;
UPDATE profiles SET course_id = NULL, department_id = NULL;

-- Also need to nullify college_id in email_otps, posts, ads, teams just in case if they have foreign keys, but let's check.
-- `email_otps.college_id` is nullable.
-- `posts.college_id` is NOT NULL but not a foreign key? Wait, in V1 it says `college_id UUID NOT NULL,`. Not a FK. So it's fine.
-- `teams.college_id` is NOT NULL but not a FK.
-- Actually, let's just clear colleges, courses, departments now since references are mostly nullified or cascade.

-- Wait, let's do the renaming first.
-- 2. Rename departments table to branches
ALTER TABLE departments RENAME TO branches;

-- 3. Rename sequences/indices/constraints on branches
ALTER INDEX IF EXISTS idx_departments_course RENAME TO idx_branches_course;
ALTER TABLE branches RENAME CONSTRAINT uq_departments_course_name TO uq_branches_course_name;

-- 4. Rename department_id to branch_id in profiles
ALTER TABLE profiles RENAME COLUMN department_id TO branch_id;
ALTER INDEX IF EXISTS idx_profiles_department RENAME TO idx_profiles_branch;

-- 5. Clear all data from branches, courses, and colleges
DELETE FROM branches;
DELETE FROM courses;
DELETE FROM email_otps;
DELETE FROM colleges;
