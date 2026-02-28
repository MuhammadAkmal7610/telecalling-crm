-- Migration: Fix tasks table and add type column

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'Todo';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Ensure other columns are correct
-- Some might already exist from database_schema.sql but we ensure it matches the service expectations
ALTER TABLE tasks ALTER COLUMN status SET DEFAULT 'Pending';
ALTER TABLE tasks ALTER COLUMN priority SET DEFAULT 'Medium';
