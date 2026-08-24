-- Ensure team_stars table exists
CREATE TABLE IF NOT EXISTS team_stars (
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (team_id, user_id)
);

-- Copy existing data from project_stars if any
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'project_stars') THEN
        INSERT INTO team_stars (team_id, user_id, created_at)
        SELECT team_id, user_id, created_at FROM project_stars
        ON CONFLICT (team_id, user_id) DO NOTHING;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_team_stars_user_id ON team_stars(user_id);
CREATE INDEX IF NOT EXISTS idx_team_stars_team_id ON team_stars(team_id);

-- Update trigger for team_stars
CREATE OR REPLACE FUNCTION update_team_stars_count() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE teams SET stars_count = stars_count + 1 WHERE id = NEW.team_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE teams SET stars_count = GREATEST(0, stars_count - 1) WHERE id = OLD.team_id;
    END IF;
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_team_stars_count ON team_stars;
CREATE TRIGGER trg_team_stars_count AFTER INSERT OR DELETE ON team_stars FOR EACH ROW EXECUTE FUNCTION update_team_stars_count();
