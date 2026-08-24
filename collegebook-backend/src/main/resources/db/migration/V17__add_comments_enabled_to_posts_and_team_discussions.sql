-- Migration V17: Add comments_enabled to posts and create team_discussions table

-- 1. Add comments_enabled column to posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS comments_enabled BOOLEAN NOT NULL DEFAULT true;

-- 2. Create team_discussions table for Collab Hub project discussions
CREATE TABLE IF NOT EXISTS team_discussions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body TEXT NOT NULL CHECK (length(body) <= 2000),
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_team_discussions_team ON team_discussions(team_id, created_at ASC);

-- 3. Trigger for updated_at on team_discussions
DROP TRIGGER IF EXISTS trg_team_discussions_updated ON team_discussions;
CREATE TRIGGER trg_team_discussions_updated BEFORE UPDATE ON team_discussions FOR EACH ROW EXECUTE FUNCTION set_updated_at();
