-- ============================================================
-- Migration 017: User Settings JSONB
-- ============================================================

-- Add a flexible settings store for per-user preferences.
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;

-- Ensure updated_at continues to work as expected (no-op if already present)
-- Note: updated_at already exists in schema.

