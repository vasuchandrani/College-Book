-- Flyway Migration V1__init.sql

-- Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Enums
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE app_role AS ENUM ('STUDENT', 'ADMIN');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender') THEN
        CREATE TYPE gender AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_status') THEN
        CREATE TYPE account_status AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'GRADUATED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'media_type') THEN
        CREATE TYPE media_type AS ENUM ('IMAGE', 'VIDEO');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'team_kind') THEN
        CREATE TYPE team_kind AS ENUM ('PROJECT', 'HACKATHON');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'team_status') THEN
        CREATE TYPE team_status AS ENUM ('OPEN', 'ONGOING', 'COMPLETED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'request_status') THEN
        CREATE TYPE request_status AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'proof_type') THEN
        CREATE TYPE proof_type AS ENUM ('GITHUB', 'CERTIFICATE', 'LIVE_LINK', 'DOCUMENT', 'OTHER');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'submission_status') THEN
        CREATE TYPE submission_status AS ENUM ('SUBMITTED', 'VERIFIED', 'REJECTED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
        CREATE TYPE notification_type AS ENUM ('JOIN_REQUEST', 'REQUEST_ACCEPTED', 'REQUEST_REJECTED', 'BADGE_VERIFIED', 'POST_COMMENT', 'POST_LIKE', 'SYSTEM');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'archive_status') THEN
        CREATE TYPE archive_status AS ENUM ('QUEUED', 'GENERATING', 'READY', 'FAILED');
    END IF;
END $$;

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END $$;

-- 1. colleges
CREATE TABLE IF NOT EXISTS colleges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    city TEXT,
    state TEXT,
    logo_url TEXT,
    email_domains TEXT[] NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_colleges_name_trgm ON colleges USING gin (name gin_trgm_ops);

-- 2. courses
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    short_name TEXT,
    duration_years SMALLINT NOT NULL CHECK (duration_years BETWEEN 1 AND 7),
    CONSTRAINT uq_courses_college_name UNIQUE (college_id, name)
);

-- 3. users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    college_id UUID NOT NULL REFERENCES colleges(id),
    email CITEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    email_verified_at TIMESTAMPTZ,
    status account_status NOT NULL DEFAULT 'PENDING',
    last_login_at TIMESTAMPTZ,
    graduates_on DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_college ON users(college_id);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- 4. user_roles
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role app_role NOT NULL,
    CONSTRAINT uq_user_roles UNIQUE (user_id, role)
);

-- 5. profiles
CREATE TABLE IF NOT EXISTS profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    handle CITEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    initials TEXT NOT NULL,
    gender gender,
    course_id UUID REFERENCES courses(id),
    current_year SMALLINT CHECK (current_year BETWEEN 1 AND 7),
    default_bio TEXT NOT NULL,
    bio_extra TEXT,
    avatar_url TEXT,
    github_url TEXT,
    linkedin_url TEXT,
    website_url TEXT,
    is_public BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_name_trgm ON profiles USING gin (full_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_profiles_course ON profiles(course_id);

-- 6. email_otps
CREATE TABLE IF NOT EXISTS email_otps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email CITEXT NOT NULL,
    college_id UUID REFERENCES colleges(id),
    code_hash TEXT NOT NULL,
    purpose TEXT NOT NULL,
    attempts SMALLINT NOT NULL DEFAULT 0,
    consumed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_otps_email ON email_otps(email) WHERE consumed_at IS NULL;

-- 7. refresh_tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    family_id UUID NOT NULL,
    user_agent TEXT,
    ip TEXT,
    revoked_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. password_resets
CREATE TABLE IF NOT EXISTS password_resets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    consumed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. tags
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name CITEXT NOT NULL UNIQUE,
    usage_count INT NOT NULL DEFAULT 0,
    is_tech BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. posts
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    college_id UUID NOT NULL,
    content TEXT NOT NULL CHECK (length(content) <= 5000),
    like_count INT NOT NULL DEFAULT 0,
    comment_count INT NOT NULL DEFAULT 0,
    save_count INT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_posts_feed ON posts (college_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts (author_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_posts_search ON posts USING gin (to_tsvector('english', content));

-- 11. post_media
CREATE TABLE IF NOT EXISTS post_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    type media_type NOT NULL,
    object_key TEXT NOT NULL,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    width INT,
    height INT,
    duration_seconds INT,
    position SMALLINT NOT NULL,
    CONSTRAINT uq_post_media_pos UNIQUE (post_id, position)
);

CREATE INDEX IF NOT EXISTS idx_post_media_post ON post_media(post_id);

-- 12. post_tags
CREATE TABLE IF NOT EXISTS post_tags (
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_post_tags_tag ON post_tags(tag_id);

-- 13. post_likes
CREATE TABLE IF NOT EXISTS post_likes (
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_post_likes_user ON post_likes(user_id, created_at DESC);

-- 14. post_saves
CREATE TABLE IF NOT EXISTS post_saves (
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_post_saves_user ON post_saves(user_id, created_at DESC);

-- 15. comments
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id),
    body TEXT NOT NULL CHECK (length(body) <= 1000),
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id, created_at ASC);

-- 16. ads
CREATE TABLE IF NOT EXISTS ads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by UUID REFERENCES users(id),
    brand_name TEXT NOT NULL,
    brand_logo_url TEXT,
    headline TEXT NOT NULL,
    body TEXT,
    discount_text TEXT,
    cta_text TEXT NOT NULL DEFAULT 'Shop Now',
    cta_url TEXT NOT NULL,
    comments_enabled BOOLEAN NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT true,
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,
    target_college_ids UUID[],
    priority SMALLINT NOT NULL DEFAULT 0,
    like_count INT NOT NULL DEFAULT 0,
    comment_count INT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ads_active ON ads (is_active, priority DESC) WHERE deleted_at IS NULL;

-- 17. ad_media
CREATE TABLE IF NOT EXISTS ad_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_id UUID NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
    type media_type NOT NULL,
    object_key TEXT NOT NULL,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    width INT,
    height INT,
    duration_seconds INT,
    position SMALLINT NOT NULL,
    CONSTRAINT uq_ad_media_pos UNIQUE (ad_id, position)
);

-- 18. ad_likes
CREATE TABLE IF NOT EXISTS ad_likes (
    ad_id UUID NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (ad_id, user_id)
);

-- 19. ad_comments
CREATE TABLE IF NOT EXISTS ad_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_id UUID NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 20. ad_metrics_daily
CREATE TABLE IF NOT EXISTS ad_metrics_daily (
    ad_id UUID NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
    day DATE NOT NULL,
    impressions BIGINT NOT NULL DEFAULT 0,
    clicks BIGINT NOT NULL DEFAULT 0,
    PRIMARY KEY (ad_id, day)
);

-- 21. teams
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES users(id),
    college_id UUID NOT NULL,
    title TEXT NOT NULL,
    kind team_kind NOT NULL,
    description TEXT,
    github_url TEXT,
    status team_status NOT NULL DEFAULT 'OPEN',
    current_members SMALLINT NOT NULL DEFAULT 1,
    slots_needed SMALLINT NOT NULL DEFAULT 0 CHECK (slots_needed >= 0),
    max_members SMALLINT GENERATED ALWAYS AS (current_members + slots_needed) STORED,
    star_count INT NOT NULL DEFAULT 0,
    completed_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_teams_college_status ON teams (college_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_teams_lead ON teams (lead_id);
CREATE INDEX IF NOT EXISTS idx_teams_title_trgm ON teams USING gin (title gin_trgm_ops);

-- 22. team_members
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    is_lead BOOLEAN NOT NULL DEFAULT false,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_team_members UNIQUE (team_id, user_id)
);

-- 23. team_required_expertise
CREATE TABLE IF NOT EXISTS team_required_expertise (
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    slots SMALLINT NOT NULL DEFAULT 1,
    PRIMARY KEY (team_id, tag_id)
);

-- 24. team_skills
CREATE TABLE IF NOT EXISTS team_skills (
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (team_id, tag_id)
);

-- 25. join_requests
CREATE TABLE IF NOT EXISTS join_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    desired_role TEXT NOT NULL,
    message TEXT,
    status request_status NOT NULL DEFAULT 'PENDING',
    responded_by UUID REFERENCES users(id),
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_join_requests_open ON join_requests (team_id, requester_id) WHERE status = 'PENDING';

-- 26. project_stars
CREATE TABLE IF NOT EXISTS project_stars (
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (team_id, user_id)
);

-- 27. badges
CREATE TABLE IF NOT EXISTS badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tag TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    category TEXT,
    criteria TEXT NOT NULL,
    allowed_proof_types proof_type[] NOT NULL,
    sort_order SMALLINT,
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- 28. badge_submissions
CREATE TABLE IF NOT EXISTS badge_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    proof_type proof_type NOT NULL,
    proof_url TEXT NOT NULL,
    notes TEXT,
    status submission_status NOT NULL DEFAULT 'SUBMITTED',
    reviewed_by UUID REFERENCES users(id),
    reviewer_note TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_submission_open ON badge_submissions (badge_id, user_id) WHERE status = 'SUBMITTED';

-- 29. user_badges
CREATE TABLE IF NOT EXISTS user_badges (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    submission_id UUID REFERENCES badge_submissions(id),
    earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, badge_id)
);

-- 30. notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    link TEXT,
    actor_id UUID REFERENCES users(id),
    entity_id UUID,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, created_at DESC) WHERE read_at IS NULL;

-- 31. archives
CREATE TABLE IF NOT EXISTS archives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    status archive_status NOT NULL DEFAULT 'QUEUED',
    pdf_url TEXT,
    html_url TEXT,
    generated_at TIMESTAMPTZ,
    error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 32. audit_log
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES users(id),
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    metadata JSONB,
    ip TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log (entity_type, entity_id, created_at DESC);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS trg_colleges_updated ON colleges;
CREATE TRIGGER trg_colleges_updated BEFORE UPDATE ON colleges FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_users_updated ON users;
CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_profiles_updated ON profiles;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_posts_updated ON posts;
CREATE TRIGGER trg_posts_updated BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_comments_updated ON comments;
CREATE TRIGGER trg_comments_updated BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_ads_updated ON ads;
CREATE TRIGGER trg_ads_updated BEFORE UPDATE ON ads FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_ad_comments_updated ON ad_comments;
CREATE TRIGGER trg_ad_comments_updated BEFORE UPDATE ON ad_comments FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_teams_updated ON teams;
CREATE TRIGGER trg_teams_updated BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_join_requests_updated ON join_requests;
CREATE TRIGGER trg_join_requests_updated BEFORE UPDATE ON join_requests FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_badge_submissions_updated ON badge_submissions;
CREATE TRIGGER trg_badge_submissions_updated BEFORE UPDATE ON badge_submissions FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_archives_updated ON archives;
CREATE TRIGGER trg_archives_updated BEFORE UPDATE ON archives FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Counter Triggers

CREATE OR REPLACE FUNCTION update_post_like_count() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE posts SET like_count = GREATEST(0, like_count - 1) WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END $$;

DROP TRIGGER IF EXISTS trg_post_likes_count ON post_likes;
CREATE TRIGGER trg_post_likes_count AFTER INSERT OR DELETE ON post_likes FOR EACH ROW EXECUTE FUNCTION update_post_like_count();

CREATE OR REPLACE FUNCTION update_post_save_count() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE posts SET save_count = save_count + 1 WHERE id = NEW.post_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE posts SET save_count = GREATEST(0, save_count - 1) WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END $$;

DROP TRIGGER IF EXISTS trg_post_saves_count ON post_saves;
CREATE TRIGGER trg_post_saves_count AFTER INSERT OR DELETE ON post_saves FOR EACH ROW EXECUTE FUNCTION update_post_save_count();

CREATE OR REPLACE FUNCTION update_post_comment_count() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE posts SET comment_count = GREATEST(0, comment_count - 1) WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END $$;

DROP TRIGGER IF EXISTS trg_comments_count ON comments;
CREATE TRIGGER trg_comments_count AFTER INSERT OR DELETE ON comments FOR EACH ROW EXECUTE FUNCTION update_post_comment_count();

CREATE OR REPLACE FUNCTION update_team_member_count() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE teams SET current_members = current_members + 1 WHERE id = NEW.team_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE teams SET current_members = GREATEST(1, current_members - 1) WHERE id = OLD.team_id;
    END IF;
    RETURN NULL;
END $$;

DROP TRIGGER IF EXISTS trg_team_members_count ON team_members;
CREATE TRIGGER trg_team_members_count AFTER INSERT OR DELETE ON team_members FOR EACH ROW EXECUTE FUNCTION update_team_member_count();

CREATE OR REPLACE FUNCTION update_team_star_count() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE teams SET star_count = star_count + 1 WHERE id = NEW.team_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE teams SET star_count = GREATEST(0, star_count - 1) WHERE id = OLD.team_id;
    END IF;
    RETURN NULL;
END $$;

DROP TRIGGER IF EXISTS trg_project_stars_count ON project_stars;
CREATE TRIGGER trg_project_stars_count AFTER INSERT OR DELETE ON project_stars FOR EACH ROW EXECUTE FUNCTION update_team_star_count();
