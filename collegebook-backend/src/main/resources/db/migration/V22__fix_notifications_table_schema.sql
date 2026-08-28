-- Flyway Migration V22__fix_notifications_table_schema.sql
-- Ensure notifications table matches JPA entity and supports all notification types

ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS message TEXT;

-- Convert type column to VARCHAR(50) so string-based JPA queries and enums insert seamlessly
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'notifications' AND column_name = 'type'
    ) THEN
        ALTER TABLE notifications ALTER COLUMN type TYPE VARCHAR(50) USING type::VARCHAR;
    END IF;
END $$;
