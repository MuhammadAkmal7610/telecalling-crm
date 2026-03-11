-- ============================================================
-- Email Integration Migration
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Create email templates table
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    html_content TEXT,
    category TEXT DEFAULT 'marketing', -- 'marketing', 'transactional', 'automation'
    variables JSONB DEFAULT '[]', -- Array of variable objects
    status TEXT DEFAULT 'draft', -- 'draft', 'active', 'archived'
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(workspace_id, name)
);

CREATE INDEX IF NOT EXISTS idx_email_templates_workspace ON email_templates(workspace_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_category ON email_templates(category);
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- 2. Create email campaigns table
CREATE TABLE IF NOT EXISTS email_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'draft', -- 'draft', 'scheduled', 'running', 'completed', 'paused', 'cancelled'
    schedule_type TEXT DEFAULT 'immediate', -- 'immediate', 'scheduled', 'recurring'
    scheduled_at TIMESTAMP WITH TIME ZONE,
    recurrence_pattern JSONB, -- For recurring campaigns
    target_audience JSONB NOT NULL, -- { leads: [], filters: [], segments: [] }
    sender_email TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    reply_to_email TEXT,
    track_opens BOOLEAN DEFAULT true,
    track_clicks BOOLEAN DEFAULT true,
    total_recipients INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    opened_count INTEGER DEFAULT 0,
    clicked_count INTEGER DEFAULT 0,
    bounced_count INTEGER DEFAULT 0,
    unsubscribed_count INTEGER DEFAULT 0,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_campaigns_workspace ON email_campaigns(workspace_id);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_template ON email_campaigns(template_id);
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;

-- 3. Create email logs table for tracking individual emails
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES email_campaigns(id) ON DELETE SET NULL,
    template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
    recipient_email TEXT NOT NULL,
    recipient_name TEXT,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    subject TEXT NOT NULL,
    content TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'unsubscribed', 'failed'
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    bounced_at TIMESTAMP WITH TIME ZONE,
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    external_id TEXT, -- Email service provider ID
    tracking_id TEXT, -- For open/click tracking
    variables_used JSONB DEFAULT '{}',
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_logs_campaign ON email_logs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_lead ON email_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_external ON email_logs(external_id);
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- 4. Create email automation table
CREATE TABLE IF NOT EXISTS email_automation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    trigger_type TEXT NOT NULL, -- 'lead_created', 'lead_status_change', 'time_based', 'webhook'
    trigger_config JSONB NOT NULL, -- Trigger-specific configuration
    conditions JSONB DEFAULT '[]', -- Array of conditions to check
    actions JSONB NOT NULL, -- Array of actions to execute
    is_active BOOLEAN DEFAULT true,
    trigger_count INTEGER DEFAULT 0,
    last_triggered_at TIMESTAMP WITH TIME ZONE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_automation_workspace ON email_automation(workspace_id);
CREATE INDEX IF NOT EXISTS idx_email_automation_trigger_type ON email_automation(trigger_type);
CREATE INDEX IF NOT EXISTS idx_email_automation_active ON email_automation(is_active);
ALTER TABLE email_automation ENABLE ROW LEVEL SECURITY;

-- 5. Create email automation execution logs
CREATE TABLE IF NOT EXISTS email_automation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    automation_id UUID REFERENCES email_automation(id) ON DELETE CASCADE NOT NULL,
    trigger_data JSONB NOT NULL,
    conditions_met BOOLEAN DEFAULT false,
    actions_executed JSONB DEFAULT '[]',
    execution_status TEXT DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
    error_message TEXT,
    execution_time_ms INTEGER,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_automation_logs_automation ON email_automation_logs(automation_id);
CREATE INDEX IF NOT EXISTS idx_email_automation_logs_status ON email_automation_logs(execution_status);
CREATE INDEX IF NOT EXISTS idx_email_automation_logs_created ON email_automation_logs(created_at);
ALTER TABLE email_automation_logs ENABLE ROW LEVEL SECURITY;

-- 6. Create email tracking table for opens and clicks
CREATE TABLE IF NOT EXISTS email_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email_log_id UUID REFERENCES email_logs(id) ON DELETE CASCADE NOT NULL,
    tracking_type TEXT NOT NULL, -- 'open', 'click', 'unsubscribe'
    tracking_data JSONB DEFAULT '{}', -- Additional tracking data
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_email_tracking_email_log ON email_tracking(email_log_id);
CREATE INDEX IF NOT EXISTS idx_email_tracking_type ON email_tracking(tracking_type);
CREATE INDEX IF NOT EXISTS idx_email_tracking_timestamp ON email_tracking(timestamp);
ALTER TABLE email_tracking ENABLE ROW LEVEL SECURITY;

-- 7. Create email suppression list
CREATE TABLE IF NOT EXISTS email_suppression (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL,
    reason TEXT NOT NULL, -- 'bounced', 'unsubscribed', 'complaint', 'manual'
    reason_details TEXT,
    suppressed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    suppressed_until TIMESTAMP WITH TIME ZONE, -- Temporary suppression
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(workspace_id, email)
);

CREATE INDEX IF NOT EXISTS idx_email_suppression_workspace ON email_suppression(workspace_id);
CREATE INDEX IF NOT EXISTS idx_email_suppression_email ON email_suppression(email);
CREATE INDEX IF NOT EXISTS idx_email_suppression_reason ON email_suppression(reason);
ALTER TABLE email_suppression ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies for Email Templates
CREATE POLICY "email_templates_workspace_access" ON email_templates FOR ALL
USING (
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
    OR organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin','root')
    )
);

-- 9. RLS Policies for Email Campaigns
CREATE POLICY "email_campaigns_workspace_access" ON email_campaigns FOR ALL
USING (
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
    OR organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin','root')
    )
);

-- 10. RLS Policies for Email Logs
CREATE POLICY "email_logs_workspace_access" ON email_logs FOR ALL
USING (
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
    OR organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin','root')
    )
);

-- 11. RLS Policies for Email Automation
CREATE POLICY "email_automation_workspace_access" ON email_automation FOR ALL
USING (
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
    OR organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin','root')
    )
);

-- 12. RLS Policies for Email Tracking
CREATE POLICY "email_tracking_workspace_access" ON email_tracking FOR ALL
USING (
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
    OR organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin','root')
    )
);

-- 13. Create function to update campaign statistics
CREATE OR REPLACE FUNCTION update_campaign_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE email_campaigns SET
            sent_count = (
                SELECT COUNT(*) FROM email_logs 
                WHERE campaign_id = COALESCE(NEW.campaign_id, OLD.campaign_id)
                AND status IN ('sent', 'delivered', 'opened', 'clicked')
            ),
            delivered_count = (
                SELECT COUNT(*) FROM email_logs 
                WHERE campaign_id = COALESCE(NEW.campaign_id, OLD.campaign_id)
                AND status = 'delivered'
            ),
            opened_count = (
                SELECT COUNT(*) FROM email_logs 
                WHERE campaign_id = COALESCE(NEW.campaign_id, OLD.campaign_id)
                AND status = 'opened'
            ),
            clicked_count = (
                SELECT COUNT(*) FROM email_logs 
                WHERE campaign_id = COALESCE(NEW.campaign_id, OLD.campaign_id)
                AND status = 'clicked'
            ),
            bounced_count = (
                SELECT COUNT(*) FROM email_logs 
                WHERE campaign_id = COALESCE(NEW.campaign_id, OLD.campaign_id)
                AND status = 'bounced'
            ),
            unsubscribed_count = (
                SELECT COUNT(*) FROM email_logs 
                WHERE campaign_id = COALESCE(NEW.campaign_id, OLD.campaign_id)
                AND status = 'unsubscribed'
            ),
            updated_at = NOW()
        WHERE id = COALESCE(NEW.campaign_id, OLD.campaign_id);
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 14. Create triggers for campaign statistics
CREATE TRIGGER update_campaign_stats_trigger
    AFTER INSERT OR UPDATE ON email_logs
    FOR EACH ROW EXECUTE FUNCTION update_campaign_stats();

-- 15. Create function to check email suppression
CREATE OR REPLACE FUNCTION is_email_suppressed(email_address TEXT, workspace_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM email_suppression 
        WHERE email = email_address 
        AND workspace_id = workspace_id
        AND (suppressed_until IS NULL OR suppressed_until > NOW())
    );
END;
$$ LANGUAGE plpgsql;

-- 16. Create view for campaign analytics
CREATE OR REPLACE VIEW email_campaign_analytics AS
SELECT 
    ec.id,
    ec.name,
    ec.status,
    ec.total_recipients,
    ec.sent_count,
    ec.delivered_count,
    ec.opened_count,
    ec.clicked_count,
    ec.bounced_count,
    ec.unsubscribed_count,
    CASE 
        WHEN ec.sent_count > 0 THEN ROUND((ec.delivered_count::FLOAT / ec.sent_count::FLOAT) * 100, 2)
        ELSE 0
    END as delivery_rate,
    CASE 
        WHEN ec.delivered_count > 0 THEN ROUND((ec.opened_count::FLOAT / ec.delivered_count::FLOAT) * 100, 2)
        ELSE 0
    END as open_rate,
    CASE 
        WHEN ec.opened_count > 0 THEN ROUND((ec.clicked_count::FLOAT / ec.opened_count::FLOAT) * 100, 2)
        ELSE 0
    END as click_rate,
    CASE 
        WHEN ec.sent_count > 0 THEN ROUND((ec.bounced_count::FLOAT / ec.sent_count::FLOAT) * 100, 2)
        ELSE 0
    END as bounce_rate,
    ec.workspace_id,
    ec.organization_id,
    ec.created_at
FROM email_campaigns ec;

-- 17. Create view for email performance summary
CREATE OR REPLACE VIEW email_performance_summary AS
SELECT 
    workspace_id,
    organization_id,
    COUNT(*) as total_emails,
    COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered,
    COUNT(CASE WHEN status = 'opened' THEN 1 END) as opened,
    COUNT(CASE WHEN status = 'clicked' THEN 1 END) as clicked,
    COUNT(CASE WHEN status = 'bounced' THEN 1 END) as bounced,
    COUNT(CASE WHEN status = 'unsubscribed' THEN 1 END) as unsubscribed,
    DATE_TRUNC('day', created_at) as email_date
FROM email_logs
GROUP BY workspace_id, organization_id, DATE_TRUNC('day', created_at);

-- 18. Add email to integrations seed data
INSERT INTO integrations (organization_id, name, type, status, config) 
SELECT 
    id, 
    'Email Service', 
    'email', 
    'inactive', 
    '{"provider": "sendgrid", "apiKey": "", "fromEmail": "", "fromName": "", "replyTo": "", "webhookUrl": "", "webhookSecret": ""}'::jsonb
FROM organizations 
WHERE id NOT IN (
    SELECT organization_id FROM integrations WHERE type = 'email'
);

-- 19. Add email configuration to organizations table (if not exists)
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS email_config JSONB DEFAULT '{}';

-- 20. Create function to process email automation triggers
CREATE OR REPLACE FUNCTION process_email_automation_triggers()
RETURNS TRIGGER AS $$
BEGIN
    -- This function will be called by triggers on leads table
    -- to process email automation rules
    
    IF TG_OP = 'INSERT' THEN
        -- Process lead_created triggers
        PERFORM process_automation_for_lead(NEW.id, 'lead_created', NEW);
    ELSIF TG_OP = 'UPDATE' THEN
        -- Process lead_status_change triggers
        IF OLD.status IS DISTINCT FROM NEW.status THEN
            PERFORM process_automation_for_lead(NEW.id, 'lead_status_change', NEW);
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 21. Create trigger for email automation
-- Note: This will be implemented when the automation service is created
-- CREATE TRIGGER email_automation_trigger
--     AFTER INSERT OR UPDATE ON leads
--     FOR EACH ROW EXECUTE FUNCTION process_email_automation_triggers();

-- Migration complete
SELECT 'Email integration migration completed successfully' as status;
