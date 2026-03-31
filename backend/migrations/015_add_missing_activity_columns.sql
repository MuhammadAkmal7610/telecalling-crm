-- Migration 015: Add missing columns to activities table
-- This bridges the gap between the initial schema and the current ActivitiesService implementation.

ALTER TABLE activities ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS subtitle TEXT;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS details TEXT;

-- Comments for documentation:
-- 'title' is used for activity headers (e.g., 'Lead Created').
-- 'subtitle' is used for secondary information (e.g., assignee name).
-- 'details' is used for long-form notes (replaces 'notes' in the code context).
