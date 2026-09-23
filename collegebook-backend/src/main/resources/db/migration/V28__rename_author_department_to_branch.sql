-- Rename the denormalized author_department column to author_branch (aligns with V24 rename)
ALTER TABLE posts RENAME COLUMN author_department TO author_branch;
