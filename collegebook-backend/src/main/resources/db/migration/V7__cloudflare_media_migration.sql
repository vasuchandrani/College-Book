-- Flyway Migration V7__cloudflare_media_migration.sql
-- Support Cloudflare R2 and Cloudflare Stream media tracking

ALTER TABLE post_media ADD COLUMN IF NOT EXISTS storage_provider TEXT NOT NULL DEFAULT 'R2';
ALTER TABLE post_media ADD COLUMN IF NOT EXISTS video_id TEXT;
