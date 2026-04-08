-- Migration: Fix Email Service Tables and Columns
-- Adds missing created_by columns and aligns table schemas with EmailService implementation

-- 1. Fix drip_campaigns table
ALTER TABLE drip_campaigns ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE drip_campaigns ADD COLUMN IF NOT EXISTS sender_name VARCHAR(255);
ALTER TABLE drip_campaigns ADD COLUMN IF NOT EXISTS sender_email VARCHAR(255);

-- 2. Fix email_templates table (created_by)
ALTER TABLE email_templates ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL;

-- 3. Fix email_templates table (content column)
-- Instead of renaming, we'll add content if it doesn't exist and copy from body
ALTER TABLE email_templates ADD COLUMN IF NOT EXISTS content TEXT;
UPDATE email_templates SET content = body WHERE content IS NULL AND body IS NOT NULL;

-- 4. Create email_automation table if missing
CREATE TABLE IF NOT EXISTS email_automation (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    trigger_type VARCHAR(50) NOT NULL,
    trigger_config JSONB DEFAULT '{}',
    conditions JSONB DEFAULT '[]',
    actions JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    trigger_count INTEGER DEFAULT 0,
    last_triggered_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create email_automation_logs table if missing
CREATE TABLE IF NOT EXISTS email_automation_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    automation_id UUID REFERENCES email_automation(id) ON DELETE CASCADE,
    trigger_data JSONB DEFAULT '{}',
    conditions_met BOOLEAN DEFAULT TRUE,
    actions_executed JSONB DEFAULT '[]',
    execution_status VARCHAR(20) DEFAULT 'completed',
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Enable RLS
ALTER TABLE email_automation ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_automation_logs ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies
-- Using individual statements to avoid DO block splitting issues
CREATE POLICY "WS Access Select" ON email_automation FOR SELECT USING (workspace_id = current_setting('app.current_workspace_id')::UUID);
CREATE POLICY "WS Access Insert" ON email_automation FOR INSERT WITH CHECK (workspace_id = current_setting('app.current_workspace_id')::UUID);
CREATE POLICY "WS Access Update" ON email_automation FOR UPDATE USING (workspace_id = current_setting('app.current_workspace_id')::UUID);
CREATE POLICY "WS Access Delete" ON email_automation FOR DELETE USING (workspace_id = current_setting('app.current_workspace_id')::UUID);

CREATE POLICY "WS Access Logs Select" ON email_automation_logs FOR SELECT USING (workspace_id = current_setting('app.current_workspace_id')::UUID);
CREATE POLICY "WS Access Logs Insert" ON email_automation_logs FOR INSERT WITH CHECK (workspace_id = current_setting('app.current_workspace_id')::UUID);
