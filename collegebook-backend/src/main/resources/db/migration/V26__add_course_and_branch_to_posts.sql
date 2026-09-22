-- Flyway Migration V26__add_course_and_branch_to_posts.sql
-- Add course_id and branch_id to posts for efficient querying and strict hierarchy enforcement

ALTER TABLE posts ADD COLUMN course_id UUID REFERENCES courses(id);
ALTER TABLE posts ADD COLUMN branch_id UUID REFERENCES branches(id);
