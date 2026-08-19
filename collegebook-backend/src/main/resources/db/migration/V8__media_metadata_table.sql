-- Flyway Migration V8__media_metadata_table.sql
-- Provider-agnostic media metadata table supporting S3, R2, and Cloudflare Stream

CREATE TABLE IF NOT EXISTS media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    storage_key TEXT NOT NULL,
    storage_provider TEXT NOT NULL DEFAULT 'S3',
    media_type TEXT NOT NULL DEFAULT 'IMAGE',
    content_type TEXT,
    file_size BIGINT,
    original_filename TEXT,
    url TEXT,
    thumbnail_url TEXT,
    width INT,
    height INT,
    duration_seconds INT,
    video_id TEXT,
    position SMALLINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_media_entity ON media(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_media_owner ON media(owner_id);
CREATE INDEX IF NOT EXISTS idx_media_key ON media(storage_key);
