-- Migration: Fix email_templates schema
-- Add missing columns required by the EmailService and Template UI

ALTER TABLE email_templates
ADD COLUMN IF NOT EXISTS content TEXT,
ADD COLUMN IF NOT EXISTS html_content TEXT;

-- Recommended: Ensure other standard fields exist if they were missed during manual creation
ALTER TABLE email_templates
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'marketing',
ADD COLUMN IF NOT EXISTS variables JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_email_templates_workspace ON email_templates(workspace_id);
