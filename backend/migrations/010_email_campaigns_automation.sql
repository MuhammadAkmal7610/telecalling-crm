-- Migration: Email Campaigns and Drip Automation
-- Adds tables for managing bulk email campaigns and automated drip sequences

-- 1. email_campaigns table
CREATE TABLE IF NOT EXISTS email_campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'scheduled', 'running', 'completed', 'paused', 'cancelled'
    
    -- Campaign settings
    subject TEXT,
    sender_name VARCHAR(255),
    sender_email VARCHAR(255),
    reply_to_email VARCHAR(255),
    track_opens BOOLEAN DEFAULT TRUE,
    track_clicks BOOLEAN DEFAULT TRUE,
    
    -- Scheduling
    schedule_type VARCHAR(20) DEFAULT 'immediate', -- 'immediate', 'scheduled', 'recurring'
    target_audience JSONB DEFAULT '{}',
    scheduled_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Analytics (denormalized for performance)
    total_recipients INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    opened_count INTEGER DEFAULT 0,
    clicked_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    bounced_count INTEGER DEFAULT 0,
    unsubscribed_count INTEGER DEFAULT 0,
    
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. email_logs table for detailed tracking
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES email_campaigns(id) ON DELETE SET NULL,
    template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    
    recipient_email VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(255),
    subject TEXT,
    content TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'unsubscribed', 'failed'
    error_message TEXT,
    
    external_id VARCHAR(255),
    tracking_id VARCHAR(255),
    variables_used JSONB DEFAULT '{}',
    
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    bounced_at TIMESTAMP WITH TIME ZONE,
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. drip_campaigns table (Sequences)
CREATE TABLE IF NOT EXISTS drip_campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Steps are stored as a JSONB array of { delay_hours, template_id, subject_override }
    steps JSONB DEFAULT '[]',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. drip_enrollments table
CREATE TABLE IF NOT EXISTS drip_enrollments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    drip_campaign_id UUID REFERENCES drip_campaigns(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    current_step INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'paused', 'cancelled'
    
    next_run_at TIMESTAMP WITH TIME ZONE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_run_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(drip_campaign_id, lead_id)
);

-- 5. Add indexes
CREATE INDEX IF NOT EXISTS idx_email_campaigns_ws ON email_campaigns(workspace_id);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_campaign ON email_logs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_lead ON email_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_drip_enrollments_lead ON drip_enrollments(lead_id);
CREATE INDEX IF NOT EXISTS idx_drip_enrollments_next ON drip_enrollments(next_run_at);

-- 6. Enable RLS
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE drip_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE drip_enrollments ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'email_campaigns' AND policyname = 'WS Access') THEN
        CREATE POLICY "WS Access" ON email_campaigns FOR ALL USING (workspace_id = current_setting('app.current_workspace_id')::UUID);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'email_logs' AND policyname = 'WS Access') THEN
        CREATE POLICY "WS Access" ON email_logs FOR ALL USING (workspace_id = current_setting('app.current_workspace_id')::UUID);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'drip_campaigns' AND policyname = 'WS Access') THEN
        CREATE POLICY "WS Access" ON drip_campaigns FOR ALL USING (workspace_id = current_setting('app.current_workspace_id')::UUID);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'drip_enrollments' AND policyname = 'WS Access') THEN
        CREATE POLICY "WS Access" ON drip_enrollments FOR ALL USING (
            drip_campaign_id IN (SELECT id FROM drip_campaigns WHERE workspace_id = current_setting('app.current_workspace_id')::UUID)
        );
    END IF;
END $$;

-- 8. Add category and html_content to email_templates
ALTER TABLE email_templates ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'general';
ALTER TABLE email_templates ADD COLUMN IF NOT EXISTS html_content TEXT;
ALTER TABLE email_templates ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'published';
