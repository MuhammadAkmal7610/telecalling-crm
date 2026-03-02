-- ============================================================
-- Migration 004: [Your Description Here]
-- Created: [Date]
-- ============================================================
-- 
-- TIP: Use IF NOT EXISTS / IF EXISTS so migrations are safe to re-run.
-- Example:

ALTER TABLE leads ADD COLUMN IF NOT EXISTS some_new_column TEXT;

CREATE TABLE IF NOT EXISTS some_new_table (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
