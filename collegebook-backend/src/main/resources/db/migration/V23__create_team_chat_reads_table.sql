-- Migration V23: Create team_chat_reads table for persistent unread chat tracking across logins

CREATE TABLE IF NOT EXISTS team_chat_reads (
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    last_read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (team_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_team_chat_reads_user ON team_chat_reads(user_id, team_id);
