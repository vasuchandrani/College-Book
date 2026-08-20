-- Flyway Migration V15__add_departments_and_profile_department.sql
-- 1. Ensure courses are clean degree programs for all colleges
-- Insert standard degree courses if not already present
INSERT INTO courses (college_id, name, short_name, duration_years)
SELECT c.id, 'Bachelor of Technology', 'B.Tech', 4
FROM colleges c
ON CONFLICT (college_id, name) DO NOTHING;

INSERT INTO courses (college_id, name, short_name, duration_years)
SELECT c.id, 'Master of Technology', 'M.Tech', 2
FROM colleges c
ON CONFLICT (college_id, name) DO NOTHING;

INSERT INTO courses (college_id, name, short_name, duration_years)
SELECT c.id, 'Bachelor of Computer Applications', 'BCA', 3
FROM colleges c
ON CONFLICT (college_id, name) DO NOTHING;

INSERT INTO courses (college_id, name, short_name, duration_years)
SELECT c.id, 'Master of Computer Applications', 'MCA', 2
FROM colleges c
ON CONFLICT (college_id, name) DO NOTHING;

INSERT INTO courses (college_id, name, short_name, duration_years)
SELECT c.id, 'Bachelor of Science', 'B.Sc', 3
FROM colleges c
ON CONFLICT (college_id, name) DO NOTHING;

INSERT INTO courses (college_id, name, short_name, duration_years)
SELECT c.id, 'Master of Science', 'M.Sc', 2
FROM colleges c
ON CONFLICT (college_id, name) DO NOTHING;

INSERT INTO courses (college_id, name, short_name, duration_years)
SELECT c.id, 'Master of Business Administration', 'MBA', 2
FROM colleges c
ON CONFLICT (college_id, name) DO NOTHING;

INSERT INTO courses (college_id, name, short_name, duration_years)
SELECT c.id, 'Doctor of Philosophy', 'PhD', 5
FROM colleges c
ON CONFLICT (college_id, name) DO NOTHING;

-- 2. Create departments table
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    short_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_departments_course_name UNIQUE (course_id, name)
);

CREATE INDEX IF NOT EXISTS idx_departments_course ON departments(course_id);

-- 3. Seed comprehensive departments for B.Tech courses
INSERT INTO departments (course_id, name, short_name)
SELECT c.id, 'Information Technology', 'IT'
FROM courses c
WHERE c.short_name = 'B.Tech' OR c.name ILIKE '%Bachelor of Technology%'
ON CONFLICT (course_id, name) DO NOTHING;

INSERT INTO departments (course_id, name, short_name)
SELECT c.id, 'Computer Engineering', 'CE'
FROM courses c
WHERE c.short_name = 'B.Tech' OR c.name ILIKE '%Bachelor of Technology%'
ON CONFLICT (course_id, name) DO NOTHING;

INSERT INTO departments (course_id, name, short_name)
SELECT c.id, 'Computer Science & Engineering', 'CSE'
FROM courses c
WHERE c.short_name = 'B.Tech' OR c.name ILIKE '%Bachelor of Technology%'
ON CONFLICT (course_id, name) DO NOTHING;

INSERT INTO departments (course_id, name, short_name)
SELECT c.id, 'Artificial Intelligence & Machine Learning', 'AI-ML'
FROM courses c
WHERE c.short_name = 'B.Tech' OR c.name ILIKE '%Bachelor of Technology%'
ON CONFLICT (course_id, name) DO NOTHING;

INSERT INTO departments (course_id, name, short_name)
SELECT c.id, 'Data Science & Analytics', 'Data Science'
FROM courses c
WHERE c.short_name = 'B.Tech' OR c.name ILIKE '%Bachelor of Technology%'
ON CONFLICT (course_id, name) DO NOTHING;

INSERT INTO departments (course_id, name, short_name)
SELECT c.id, 'Electronics & Communication Engineering', 'EC'
FROM courses c
WHERE c.short_name = 'B.Tech' OR c.name ILIKE '%Bachelor of Technology%'
ON CONFLICT (course_id, name) DO NOTHING;

INSERT INTO departments (course_id, name, short_name)
SELECT c.id, 'Electrical Engineering', 'EE'
FROM courses c
WHERE c.short_name = 'B.Tech' OR c.name ILIKE '%Bachelor of Technology%'
ON CONFLICT (course_id, name) DO NOTHING;

INSERT INTO departments (course_id, name, short_name)
SELECT c.id, 'Mechanical Engineering', 'ME'
FROM courses c
WHERE c.short_name = 'B.Tech' OR c.name ILIKE '%Bachelor of Technology%'
ON CONFLICT (course_id, name) DO NOTHING;

INSERT INTO departments (course_id, name, short_name)
SELECT c.id, 'Civil Engineering', 'Civil'
FROM courses c
WHERE c.short_name = 'B.Tech' OR c.name ILIKE '%Bachelor of Technology%'
ON CONFLICT (course_id, name) DO NOTHING;

INSERT INTO departments (course_id, name, short_name)
SELECT c.id, 'Chemical Engineering', 'Chemical'
FROM courses c
WHERE c.short_name = 'B.Tech' OR c.name ILIKE '%Bachelor of Technology%'
ON CONFLICT (course_id, name) DO NOTHING;

INSERT INTO departments (course_id, name, short_name)
SELECT c.id, 'Instrumentation & Control', 'IC'
FROM courses c
WHERE c.short_name = 'B.Tech' OR c.name ILIKE '%Bachelor of Technology%'
ON CONFLICT (course_id, name) DO NOTHING;

-- Seed departments for M.Tech courses
INSERT INTO departments (course_id, name, short_name)
SELECT c.id, 'Computer Science & Engineering', 'CSE'
FROM courses c
WHERE c.short_name = 'M.Tech' OR c.name ILIKE '%Master of Technology%'
ON CONFLICT (course_id, name) DO NOTHING;

INSERT INTO departments (course_id, name, short_name)
SELECT c.id, 'Information Technology', 'IT'
FROM courses c
WHERE c.short_name = 'M.Tech' OR c.name ILIKE '%Master of Technology%'
ON CONFLICT (course_id, name) DO NOTHING;

INSERT INTO departments (course_id, name, short_name)
SELECT c.id, 'VLSI Design & Embedded Systems', 'VLSI'
FROM courses c
WHERE c.short_name = 'M.Tech' OR c.name ILIKE '%Master of Technology%'
ON CONFLICT (course_id, name) DO NOTHING;

INSERT INTO departments (course_id, name, short_name)
SELECT c.id, 'Thermal Engineering', 'Thermal'
FROM courses c
WHERE c.short_name = 'M.Tech' OR c.name ILIKE '%Master of Technology%'
ON CONFLICT (course_id, name) DO NOTHING;

INSERT INTO departments (course_id, name, short_name)
SELECT c.id, 'Structural Engineering', 'Structural'
FROM courses c
WHERE c.short_name = 'M.Tech' OR c.name ILIKE '%Master of Technology%'
ON CONFLICT (course_id, name) DO NOTHING;

-- Seed departments for BCA courses
INSERT INTO departments (course_id, name, short_name)
SELECT c.id, 'Computer Applications', 'BCA'
FROM courses c
WHERE c.short_name = 'BCA' OR c.name ILIKE '%Bachelor of Computer Applications%'
ON CONFLICT (course_id, name) DO NOTHING;

INSERT INTO departments (course_id, name, short_name)
SELECT c.id, 'Software Development', 'SD'
FROM courses c
WHERE c.short_name = 'BCA' OR c.name ILIKE '%Bachelor of Computer Applications%'
ON CONFLICT (course_id, name) DO NOTHING;

INSERT INTO departments (course_id, name, short_name)
SELECT c.id, 'Data Analytics', 'DA'
FROM courses c
WHERE c.short_name = 'BCA' OR c.name ILIKE '%Bachelor of Computer Applications%'
ON CONFLICT (course_id, name) DO NOTHING;

-- Seed departments for MCA courses
INSERT INTO departments (course_id, name, short_name)
SELECT c.id, 'Computer Applications', 'MCA'
FROM courses c
WHERE c.short_name = 'MCA' OR c.name ILIKE '%Master of Computer Applications%'
ON CONFLICT (course_id, name) DO NOTHING;

INSERT INTO departments (course_id, name, short_name)
SELECT c.id, 'Cloud Computing & DevOps', 'Cloud'
FROM courses c
WHERE c.short_name = 'MCA' OR c.name ILIKE '%Master of Computer Applications%'
ON CONFLICT (course_id, name) DO NOTHING;

INSERT INTO departments (course_id, name, short_name)
SELECT c.id, 'Artificial Intelligence', 'AI'
FROM courses c
WHERE c.short_name = 'MCA' OR c.name ILIKE '%Master of Computer Applications%'
ON CONFLICT (course_id, name) DO NOTHING;

-- Seed departments for B.Sc & M.Sc courses
INSERT INTO departments (course_id, name, short_name)
SELECT c.id, 'Computer Science', 'CS'
FROM courses c
WHERE c.short_name IN ('B.Sc', 'M.Sc') OR c.name ILIKE '%Science%'
ON CONFLICT (course_id, name) DO NOTHING;

INSERT INTO departments (course_id, name, short_name)
SELECT c.id, 'Information Technology', 'IT'
FROM courses c
WHERE c.short_name IN ('B.Sc', 'M.Sc') OR c.name ILIKE '%Science%'
ON CONFLICT (course_id, name) DO NOTHING;

INSERT INTO departments (course_id, name, short_name)
SELECT c.id, 'Applied Mathematics & Computing', 'Math'
FROM courses c
WHERE c.short_name IN ('B.Sc', 'M.Sc') OR c.name ILIKE '%Science%'
ON CONFLICT (course_id, name) DO NOTHING;

-- Seed departments for MBA courses
INSERT INTO departments (course_id, name, short_name)
SELECT c.id, 'Business Analytics & Information Systems', 'BA-IT'
FROM courses c
WHERE c.short_name = 'MBA' OR c.name ILIKE '%Master of Business Administration%'
ON CONFLICT (course_id, name) DO NOTHING;

INSERT INTO departments (course_id, name, short_name)
SELECT c.id, 'Finance', 'Finance'
FROM courses c
WHERE c.short_name = 'MBA' OR c.name ILIKE '%Master of Business Administration%'
ON CONFLICT (course_id, name) DO NOTHING;

INSERT INTO departments (course_id, name, short_name)
SELECT c.id, 'Marketing', 'Marketing'
FROM courses c
WHERE c.short_name = 'MBA' OR c.name ILIKE '%Master of Business Administration%'
ON CONFLICT (course_id, name) DO NOTHING;

INSERT INTO departments (course_id, name, short_name)
SELECT c.id, 'Human Resource Management', 'HR'
FROM courses c
WHERE c.short_name = 'MBA' OR c.name ILIKE '%Master of Business Administration%'
ON CONFLICT (course_id, name) DO NOTHING;

-- Seed departments for PhD courses
INSERT INTO departments (course_id, name, short_name)
SELECT c.id, 'Computer Science & Engineering', 'CSE'
FROM courses c
WHERE c.short_name = 'PhD' OR c.name ILIKE '%Doctor of Philosophy%'
ON CONFLICT (course_id, name) DO NOTHING;

INSERT INTO departments (course_id, name, short_name)
SELECT c.id, 'Information Technology', 'IT'
FROM courses c
WHERE c.short_name = 'PhD' OR c.name ILIKE '%Doctor of Philosophy%'
ON CONFLICT (course_id, name) DO NOTHING;

-- 4. Add department_id to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id);
CREATE INDEX IF NOT EXISTS idx_profiles_department ON profiles(department_id);

-- 5. Backfill existing profiles: Set course to B.Tech and department to Information Technology for each profile's college
-- Update course_id to B.Tech course of the user's college
UPDATE profiles
SET course_id = c.id
FROM users u, courses c
WHERE profiles.user_id = u.id
  AND c.college_id = u.college_id
  AND (c.short_name = 'B.Tech' OR c.name ILIKE '%Bachelor of Technology%');

-- Update department_id to 'Information Technology' department of the B.Tech course
UPDATE profiles
SET department_id = d.id
FROM departments d
WHERE d.course_id = profiles.course_id 
  AND d.name = 'Information Technology';

-- If any profile still has null department_id, pick the first department of their course
UPDATE profiles
SET department_id = (
    SELECT d.id FROM departments d WHERE d.course_id = profiles.course_id LIMIT 1
)
WHERE profiles.department_id IS NULL AND profiles.course_id IS NOT NULL;

-- 6. Recompute default_bio for all profiles based on B.Tech + Department + Current Year + College Name
UPDATE profiles
SET default_bio = CONCAT(
    COALESCE(c.short_name, c.name, 'B.Tech'), ' ',
    COALESCE(d.name, 'Information Technology'), ' • ',
    CASE
        WHEN COALESCE(profiles.current_year, 1) = 1 THEN '1st'
        WHEN COALESCE(profiles.current_year, 1) = 2 THEN '2nd'
        WHEN COALESCE(profiles.current_year, 1) = 3 THEN '3rd'
        ELSE CONCAT(COALESCE(profiles.current_year, 1), 'th')
    END, ' Year • ',
    col.name
)
FROM users u, colleges col, courses c, departments d
WHERE profiles.user_id = u.id
  AND col.id = u.college_id
  AND c.id = profiles.course_id
  AND d.id = profiles.department_id;
