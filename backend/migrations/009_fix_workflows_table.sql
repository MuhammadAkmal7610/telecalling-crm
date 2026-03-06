-- Fix workflows table for enhanced workflow engine
-- This migration handles the transition from old action column to new actions array

-- 1. Add new columns if they don't exist
ALTER TABLE workflows 
ADD COLUMN IF NOT EXISTS conditions JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS actions JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS is_test_mode BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS description TEXT;

-- 2. Drop the old action column if it exists (to avoid NOT NULL constraint issues)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'workflows' 
        AND column_name = 'action'
    ) THEN
        ALTER TABLE workflows DROP COLUMN action;
    END IF;
END $$;

-- 3. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_workflows_org ON workflows(organization_id);
CREATE INDEX IF NOT EXISTS idx_workflows_ws ON workflows(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workflows_active ON workflows(is_active);
