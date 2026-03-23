-- ========================================
-- COURSE + LIVE METADATA PERSISTENCE
-- ========================================

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'cours'
    ) THEN
        ALTER TABLE cours
            ADD COLUMN IF NOT EXISTS metadata_json TEXT;
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'session_streaming'
    ) THEN
        ALTER TABLE session_streaming
            ADD COLUMN IF NOT EXISTS metadata_json TEXT;
    ELSIF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'sessionstreaming'
    ) THEN
        ALTER TABLE sessionstreaming
            ADD COLUMN IF NOT EXISTS metadata_json TEXT;
    END IF;
END $$;
