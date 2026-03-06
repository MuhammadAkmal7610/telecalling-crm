-- Enhanced Workflow Engine Tables for TeleCRM.in Compatibility
-- This migration adds comprehensive workflow automation capabilities

-- 1. Enhanced workflow_executions table for better tracking
CREATE TABLE IF NOT EXISTS workflow_executions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    trigger_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'running', 'success', 'failed'
    error_message TEXT,
    execution_data JSONB DEFAULT '{}',
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 2. Email queue for automated emails
CREATE TABLE IF NOT EXISTS email_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(500),
    body TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'failed'
    sent_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    attempts INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. SMS queue for automated SMS
CREATE TABLE IF NOT EXISTS sms_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    template_id UUID REFERENCES sms_templates(id) ON DELETE SET NULL,
    recipient VARCHAR(20) NOT NULL,
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'failed'
    sent_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    attempts INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Webhook queue for external API calls
CREATE TABLE IF NOT EXISTS webhook_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    method VARCHAR(10) DEFAULT 'POST',
    headers JSONB DEFAULT '{}',
    body TEXT,
    response_code INTEGER,
    response_body TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'failed'
    sent_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    attempts INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Email templates table
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    subject TEXT,
    body TEXT,
    variables JSONB DEFAULT '[]', -- Array of variable definitions
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. SMS templates table
CREATE TABLE IF NOT EXISTS sms_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    message TEXT,
    variables JSONB DEFAULT '[]', -- Array of variable definitions
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Update workflows table to support new structure
ALTER TABLE workflows 
ADD COLUMN IF NOT EXISTS conditions JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS actions JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS is_test_mode BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS description TEXT;

-- 8. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow ON workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_lead ON workflow_executions(lead_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_lead ON email_queue(lead_id);
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_sms_queue_lead ON sms_queue(lead_id);
CREATE INDEX IF NOT EXISTS idx_sms_queue_status ON sms_queue(status);
CREATE INDEX IF NOT EXISTS idx_webhook_queue_lead ON webhook_queue(lead_id);
CREATE INDEX IF NOT EXISTS idx_webhook_queue_status ON webhook_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_templates_org ON email_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_ws ON email_templates(workspace_id);
CREATE INDEX IF NOT EXISTS idx_sms_templates_org ON sms_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_sms_templates_ws ON sms_templates(workspace_id);

-- 9. Enable RLS on new tables
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_templates ENABLE ROW LEVEL SECURITY;

-- 10. RLS Policies for workflow_executions
CREATE POLICY "Users can view workflow executions in their workspace" ON workflow_executions
    FOR SELECT USING (
        workspace_id IN (
            SELECT id FROM workspaces WHERE 
            id = current_setting('app.current_workspace_id')::UUID
        )
    );

CREATE POLICY "Users can insert workflow executions in their workspace" ON workflow_executions
    FOR INSERT WITH CHECK (
        workspace_id = current_setting('app.current_workspace_id')::UUID
    );

-- 11. RLS Policies for email_queue
CREATE POLICY "Users can view email queue in their workspace" ON email_queue
    FOR SELECT USING (
        workspace_id IN (
            SELECT id FROM workspaces WHERE 
            id = current_setting('app.current_workspace_id')::UUID
        )
    );

CREATE POLICY "Users can insert email queue in their workspace" ON email_queue
    FOR INSERT WITH CHECK (
        workspace_id = current_setting('app.current_workspace_id')::UUID
    );

-- 12. RLS Policies for sms_queue
CREATE POLICY "Users can view SMS queue in their workspace" ON sms_queue
    FOR SELECT USING (
        workspace_id IN (
            SELECT id FROM workspaces WHERE 
            id = current_setting('app.current_workspace_id')::UUID
        )
    );

CREATE POLICY "Users can insert SMS queue in their workspace" ON sms_queue
    FOR INSERT WITH CHECK (
        workspace_id = current_setting('app.current_workspace_id')::UUID
    );

-- 13. RLS Policies for webhook_queue
CREATE POLICY "Users can view webhook queue in their workspace" ON webhook_queue
    FOR SELECT USING (
        workspace_id IN (
            SELECT id FROM workspaces WHERE 
            id = current_setting('app.current_workspace_id')::UUID
        )
    );

CREATE POLICY "Users can insert webhook queue in their workspace" ON webhook_queue
    FOR INSERT WITH CHECK (
        workspace_id = current_setting('app.current_workspace_id')::UUID
    );

-- 14. RLS Policies for templates
CREATE POLICY "Users can view email templates in their workspace" ON email_templates
    FOR SELECT USING (
        workspace_id IN (
            SELECT id FROM workspaces WHERE 
            id = current_setting('app.current_workspace_id')::UUID
        )
    );

CREATE POLICY "Users can insert email templates in their workspace" ON email_templates
    FOR INSERT WITH CHECK (
        workspace_id = current_setting('app.current_workspace_id')::UUID
    );

CREATE POLICY "Users can view SMS templates in their workspace" ON sms_templates
    FOR SELECT USING (
        workspace_id IN (
            SELECT id FROM workspaces WHERE 
            id = current_setting('app.current_workspace_id')::UUID
        )
    );

CREATE POLICY "Users can insert SMS templates in their workspace" ON sms_templates
    FOR INSERT WITH CHECK (
        workspace_id = current_setting('app.current_workspace_id')::UUID
    );

-- 15. Insert sample email templates
INSERT INTO email_templates (organization_id, workspace_id, name, subject, body, variables) 
SELECT 
    o.id,
    w.id,
    'Welcome Email',
    'Welcome to Our CRM!',
    'Hello {{lead.name}}, welcome to our CRM system. We''re excited to work with you!',
    '["name", "email"]'
FROM organizations o
CROSS JOIN workspaces w ON w.organization_id = o.id AND w.is_default = true
WHERE NOT EXISTS (SELECT 1 FROM email_templates WHERE organization_id = o.id LIMIT 1);

-- 16. Insert sample SMS templates
INSERT INTO sms_templates (organization_id, workspace_id, name, message, variables)
SELECT 
    o.id,
    w.id,
    'Follow Up SMS',
    'Hi {{lead.name}}, just following up on your inquiry. Available?',
    '["name", "phone"]'
FROM organizations o
CROSS JOIN workspaces w ON w.organization_id = o.id AND w.is_default = true
WHERE NOT EXISTS (SELECT 1 FROM sms_templates WHERE organization_id = o.id LIMIT 1);

COMMIT;
