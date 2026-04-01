-- Migration 021: WhatsApp Campaigns and Automation
-- Adds comprehensive WhatsApp campaign management and automation features

-- 1. whatsapp_campaigns table for bulk messaging campaigns
CREATE TABLE IF NOT EXISTS whatsapp_campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    campaign_type VARCHAR(20) DEFAULT 'bulk', -- 'bulk', 'drip', 'triggered'
    
    -- Campaign settings
    template_name VARCHAR(255),
    message_content TEXT,
    variables_mapping JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'scheduled', 'running', 'completed', 'paused', 'cancelled'
    
    -- Targeting and filtering
    target_audience JSONB DEFAULT '{}', -- { field: value, operator: 'equals|contains|in' }
    lead_filters JSONB DEFAULT '{}',
    
    -- Scheduling
    schedule_type VARCHAR(20) DEFAULT 'immediate', -- 'immediate', 'scheduled', 'recurring'
    scheduled_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Analytics (denormalized for performance)
    total_recipients INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    read_count INTEGER DEFAULT 0,
    replied_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    blocked_count INTEGER DEFAULT 0,
    
    -- Campaign settings
    max_retries INTEGER DEFAULT 3,
    retry_interval_minutes INTEGER DEFAULT 60,
    rate_limit_per_hour INTEGER DEFAULT 1000,
    
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. whatsapp_campaign_recipients table for tracking individual messages
CREATE TABLE IF NOT EXISTS whatsapp_campaign_recipients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID REFERENCES whatsapp_campaigns(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    
    phone_number VARCHAR(20) NOT NULL,
    message_content TEXT,
    variables_used JSONB DEFAULT '{}',
    
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'read', 'replied', 'failed', 'blocked'
    external_message_id VARCHAR(255),
    error_message TEXT,
    
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    replied_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    
    retry_count INTEGER DEFAULT 0,
    next_retry_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. whatsapp_drip_sequences table for automated drip campaigns
CREATE TABLE IF NOT EXISTS whatsapp_drip_sequences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    enrollment_trigger VARCHAR(50) DEFAULT 'lead_created', -- 'lead_created', 'status_change', 'manual'
    trigger_conditions JSONB DEFAULT '{}',
    
    -- Steps are stored as a JSONB array of { step_number, delay_minutes, template_name, message_content, conditions }
    steps JSONB DEFAULT '[]',
    
    max_enrollments_per_lead INTEGER DEFAULT 1,
    cooldown_days INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. whatsapp_drip_enrollments table for tracking drip sequence progress
CREATE TABLE IF NOT EXISTS whatsapp_drip_enrollments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    drip_sequence_id UUID REFERENCES whatsapp_drip_sequences(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    
    current_step INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'paused', 'cancelled', 'failed'
    enrollment_reason VARCHAR(50), -- 'lead_created', 'status_change', 'manual'
    
    next_run_at TIMESTAMP WITH TIME ZONE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_run_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    step_attempts JSONB DEFAULT '{}', -- { step_number: attempt_count }
    
    UNIQUE(drip_sequence_id, lead_id)
);

-- 5. whatsapp_drip_messages table for tracking individual drip messages
CREATE TABLE IF NOT EXISTS whatsapp_drip_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    enrollment_id UUID REFERENCES whatsapp_drip_enrollments(id) ON DELETE CASCADE,
    drip_sequence_id UUID REFERENCES whatsapp_drip_sequences(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    
    step_number INTEGER NOT NULL,
    template_name VARCHAR(255),
    message_content TEXT,
    variables_used JSONB DEFAULT '{}',
    
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'read', 'replied', 'failed'
    external_message_id VARCHAR(255),
    error_message TEXT,
    
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    replied_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. whatsapp_templates table for managing message templates
CREATE TABLE IF NOT EXISTS whatsapp_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(20) DEFAULT 'marketing', -- 'marketing', 'utility', 'authentication'
    language VARCHAR(10) DEFAULT 'en_US',
    template_id VARCHAR(255), -- Meta template ID
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'submitted', 'approved', 'rejected', 'published'
    
    -- Template content
    header_type VARCHAR(20), -- 'text', 'image', 'document', 'video'
    header_content TEXT,
    body_text TEXT,
    footer_text TEXT,
    
    -- Interactive components
    buttons JSONB DEFAULT '[]', -- Array of button objects
    quick_replies JSONB DEFAULT '[]', -- Array of quick reply objects
    
    -- Template variables
    variables JSONB DEFAULT '[]', -- Array of variable names
    
    -- Meta approval workflow
    meta_template_id VARCHAR(255),
    approval_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    rejection_reason TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE,
    rejected_at TIMESTAMP WITH TIME ZONE,
    
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. whatsapp_automation_rules table for event-triggered automation
CREATE TABLE IF NOT EXISTS whatsapp_automation_rules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Trigger configuration
    trigger_event VARCHAR(50) NOT NULL, -- 'lead_created', 'lead_assigned', 'lead_status_change', 'message_received'
    trigger_conditions JSONB DEFAULT '{}',
    
    -- Action configuration
    action_type VARCHAR(20) NOT NULL, -- 'send_message', 'send_template', 'enroll_sequence'
    action_config JSONB DEFAULT '{}',
    
    -- Rate limiting and throttling
    max_executions_per_lead INTEGER DEFAULT 1,
    cooldown_minutes INTEGER DEFAULT 0,
    execution_limit_per_hour INTEGER DEFAULT 100,
    
    -- Scheduling
    schedule_config JSONB DEFAULT '{}',
    
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. whatsapp_automation_executions table for tracking rule executions
CREATE TABLE IF NOT EXISTS whatsapp_automation_executions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rule_id UUID REFERENCES whatsapp_automation_rules(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    
    trigger_event VARCHAR(50),
    trigger_data JSONB DEFAULT '{}',
    action_type VARCHAR(20),
    action_result JSONB DEFAULT '{}',
    
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'executed', 'failed', 'skipped'
    error_message TEXT,
    
    executed_at TIMESTAMP WITH TIME ZONE,
    scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. whatsapp_analytics table for campaign performance metrics
CREATE TABLE IF NOT EXISTS whatsapp_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    
    metric_type VARCHAR(30) NOT NULL, -- 'campaign_performance', 'sequence_performance', 'template_performance', 'overall_metrics'
    metric_date DATE NOT NULL,
    
    -- Core metrics
    total_messages_sent INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    read_count INTEGER DEFAULT 0,
    replied_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    blocked_count INTEGER DEFAULT 0,
    
    -- Engagement metrics
    delivery_rate DECIMAL(5,2) DEFAULT 0.00,
    read_rate DECIMAL(5,2) DEFAULT 0.00,
    reply_rate DECIMAL(5,2) DEFAULT 0.00,
    conversion_rate DECIMAL(5,2) DEFAULT 0.00,
    
    -- Campaign specific
    campaign_id UUID REFERENCES whatsapp_campaigns(id) ON DELETE CASCADE,
    sequence_id UUID REFERENCES whatsapp_drip_sequences(id) ON DELETE CASCADE,
    template_id UUID REFERENCES whatsapp_templates(id) ON DELETE CASCADE,
    
    -- Additional context
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_campaigns_ws ON whatsapp_campaigns(workspace_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_campaigns_status ON whatsapp_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_campaigns_type ON whatsapp_campaigns(campaign_type);
CREATE INDEX IF NOT EXISTS idx_whatsapp_campaign_recipients_campaign ON whatsapp_campaign_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_campaign_recipients_lead ON whatsapp_campaign_recipients(lead_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_campaign_recipients_status ON whatsapp_campaign_recipients(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_drip_sequences_ws ON whatsapp_drip_sequences(workspace_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_drip_sequences_active ON whatsapp_drip_sequences(is_active);
CREATE INDEX IF NOT EXISTS idx_whatsapp_drip_enrollments_sequence ON whatsapp_drip_enrollments(drip_sequence_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_drip_enrollments_lead ON whatsapp_drip_enrollments(lead_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_drip_enrollments_status ON whatsapp_drip_enrollments(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_drip_enrollments_next_run ON whatsapp_drip_enrollments(next_run_at);
CREATE INDEX IF NOT EXISTS idx_whatsapp_drip_messages_enrollment ON whatsapp_drip_messages(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_drip_messages_status ON whatsapp_drip_messages(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_ws ON whatsapp_templates(workspace_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_status ON whatsapp_templates(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_category ON whatsapp_templates(category);
CREATE INDEX IF NOT EXISTS idx_whatsapp_automation_rules_ws ON whatsapp_automation_rules(workspace_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_automation_rules_active ON whatsapp_automation_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_whatsapp_automation_executions_rule ON whatsapp_automation_executions(rule_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_automation_executions_lead ON whatsapp_automation_executions(lead_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_analytics_ws ON whatsapp_analytics(workspace_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_analytics_date ON whatsapp_analytics(metric_date);
CREATE INDEX IF NOT EXISTS idx_whatsapp_analytics_type ON whatsapp_analytics(metric_type);

-- 11. Enable RLS
ALTER TABLE whatsapp_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_drip_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_drip_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_drip_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_automation_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_analytics ENABLE ROW LEVEL SECURITY;

-- 12. RLS Policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'whatsapp_campaigns' AND policyname = 'WS Access') THEN
        CREATE POLICY "WS Access" ON whatsapp_campaigns FOR ALL USING (workspace_id = current_setting('app.current_workspace_id')::UUID);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'whatsapp_campaign_recipients' AND policyname = 'WS Access') THEN
        CREATE POLICY "WS Access" ON whatsapp_campaign_recipients FOR ALL USING (workspace_id = current_setting('app.current_workspace_id')::UUID);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'whatsapp_drip_sequences' AND policyname = 'WS Access') THEN
        CREATE POLICY "WS Access" ON whatsapp_drip_sequences FOR ALL USING (workspace_id = current_setting('app.current_workspace_id')::UUID);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'whatsapp_drip_enrollments' AND policyname = 'WS Access') THEN
        CREATE POLICY "WS Access" ON whatsapp_drip_enrollments FOR ALL USING (
            drip_sequence_id IN (SELECT id FROM whatsapp_drip_sequences WHERE workspace_id = current_setting('app.current_workspace_id')::UUID)
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'whatsapp_drip_messages' AND policyname = 'WS Access') THEN
        CREATE POLICY "WS Access" ON whatsapp_drip_messages FOR ALL USING (
            drip_sequence_id IN (SELECT id FROM whatsapp_drip_sequences WHERE workspace_id = current_setting('app.current_workspace_id')::UUID)
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'whatsapp_templates' AND policyname = 'WS Access') THEN
        CREATE POLICY "WS Access" ON whatsapp_templates FOR ALL USING (workspace_id = current_setting('app.current_workspace_id')::UUID);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'whatsapp_automation_rules' AND policyname = 'WS Access') THEN
        CREATE POLICY "WS Access" ON whatsapp_automation_rules FOR ALL USING (workspace_id = current_setting('app.current_workspace_id')::UUID);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'whatsapp_automation_executions' AND policyname = 'WS Access') THEN
        CREATE POLICY "WS Access" ON whatsapp_automation_executions FOR ALL USING (
            rule_id IN (SELECT id FROM whatsapp_automation_rules WHERE workspace_id = current_setting('app.current_workspace_id')::UUID)
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'whatsapp_analytics' AND policyname = 'WS Access') THEN
        CREATE POLICY "WS Access" ON whatsapp_analytics FOR ALL USING (workspace_id = current_setting('app.current_workspace_id')::UUID);
    END IF;
END $$;

-- 13. Add triggers for automatic analytics updates
CREATE OR REPLACE FUNCTION update_whatsapp_analytics()
RETURNS TRIGGER AS $$
DECLARE
    today_date DATE := CURRENT_DATE;
BEGIN
    -- Update or insert daily analytics
    INSERT INTO whatsapp_analytics (
        organization_id, workspace_id, metric_type, metric_date,
        total_messages_sent, delivered_count, read_count, replied_count, failed_count, blocked_count
    )
    VALUES (
        NEW.organization_id, NEW.workspace_id, 'overall_metrics', today_date,
        1, 
        CASE WHEN NEW.status = 'delivered' THEN 1 ELSE 0 END,
        CASE WHEN NEW.status = 'read' THEN 1 ELSE 0 END,
        CASE WHEN NEW.status = 'replied' THEN 1 ELSE 0 END,
        CASE WHEN NEW.status = 'failed' THEN 1 ELSE 0 END,
        CASE WHEN NEW.status = 'blocked' THEN 1 ELSE 0 END
    )
    ON CONFLICT (workspace_id, metric_type, metric_date)
    DO UPDATE SET
        total_messages_sent = whatsapp_analytics.total_messages_sent + 1,
        delivered_count = whatsapp_analytics.delivered_count + CASE WHEN NEW.status = 'delivered' THEN 1 ELSE 0 END,
        read_count = whatsapp_analytics.read_count + CASE WHEN NEW.status = 'read' THEN 1 ELSE 0 END,
        replied_count = whatsapp_analytics.replied_count + CASE WHEN NEW.status = 'replied' THEN 1 ELSE 0 END,
        failed_count = whatsapp_analytics.failed_count + CASE WHEN NEW.status = 'failed' THEN 1 ELSE 0 END,
        blocked_count = whatsapp_analytics.blocked_count + CASE WHEN NEW.status = 'blocked' THEN 1 ELSE 0 END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for campaign recipients
DROP TRIGGER IF EXISTS trigger_update_whatsapp_analytics ON whatsapp_campaign_recipients;
CREATE TRIGGER trigger_update_whatsapp_analytics
    AFTER INSERT OR UPDATE ON whatsapp_campaign_recipients
    FOR EACH ROW
    EXECUTE FUNCTION update_whatsapp_analytics();

-- Create trigger for drip messages
DROP TRIGGER IF EXISTS trigger_update_whatsapp_drip_analytics ON whatsapp_drip_messages;
CREATE TRIGGER trigger_update_whatsapp_drip_analytics
    AFTER INSERT OR UPDATE ON whatsapp_drip_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_whatsapp_analytics();