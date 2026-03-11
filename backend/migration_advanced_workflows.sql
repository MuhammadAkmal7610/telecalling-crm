-- ============================================================
-- Advanced Workflows Migration
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Create workflow definitions table
CREATE TABLE IF NOT EXISTS workflow_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'custom', -- 'lead_management', 'communication', 'automation', 'custom'
    trigger_type TEXT NOT NULL, -- 'manual', 'webhook', 'schedule', 'event_based', 'data_change'
    trigger_config JSONB NOT NULL, -- Configuration specific to trigger type
    nodes JSONB NOT NULL, -- Workflow nodes and connections
    variables JSONB DEFAULT '{}', -- Global workflow variables
    settings JSONB DEFAULT '{}', -- Workflow settings (retry policy, timeout, etc.)
    status TEXT DEFAULT 'draft', -- 'draft', 'active', 'paused', 'archived'
    version INTEGER DEFAULT 1,
    is_template BOOLEAN DEFAULT false,
    template_category TEXT,
    usage_count INTEGER DEFAULT 0,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workflow_definitions_workspace ON workflow_definitions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workflow_definitions_status ON workflow_definitions(status);
CREATE INDEX IF NOT EXISTS idx_workflow_definitions_trigger_type ON workflow_definitions(trigger_type);
CREATE INDEX IF NOT EXISTS idx_workflow_definitions_category ON workflow_definitions(category);
ALTER TABLE workflow_definitions ENABLE ROW LEVEL SECURITY;

-- 2. Create workflow executions table
CREATE TABLE IF NOT EXISTS workflow_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID REFERENCES workflow_definitions(id) ON DELETE CASCADE NOT NULL,
    execution_id TEXT UNIQUE NOT NULL, -- Unique execution identifier
    trigger_data JSONB NOT NULL, -- Data that triggered the workflow
    status TEXT DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed', 'cancelled', 'paused'
    current_node_id TEXT, -- ID of the currently executing node
    execution_context JSONB DEFAULT '{}', -- Runtime variables and context
    error_message TEXT,
    error_details JSONB,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_ms INTEGER,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    next_retry_at TIMESTAMP WITH TIME ZONE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    triggered_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow ON workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_execution_id ON workflow_executions(execution_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_started_at ON workflow_executions(started_at);
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;

-- 3. Create workflow execution logs table
CREATE TABLE IF NOT EXISTS workflow_execution_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    execution_id UUID REFERENCES workflow_executions(id) ON DELETE CASCADE NOT NULL,
    node_id TEXT NOT NULL,
    node_type TEXT NOT NULL, -- 'trigger', 'action', 'condition', 'delay', 'webhook', 'email', 'sms', 'whatsapp'
    status TEXT NOT NULL, -- 'started', 'completed', 'failed', 'skipped'
    input_data JSONB DEFAULT '{}',
    output_data JSONB DEFAULT '{}',
    error_message TEXT,
    execution_time_ms INTEGER,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_workflow_execution_logs_execution ON workflow_execution_logs(execution_id);
CREATE INDEX IF NOT EXISTS idx_workflow_execution_logs_node ON workflow_execution_logs(node_id);
CREATE INDEX IF NOT EXISTS idx_workflow_execution_logs_status ON workflow_execution_logs(status);
CREATE INDEX IF NOT EXISTS idx_workflow_execution_logs_started_at ON workflow_execution_logs(started_at);
ALTER TABLE workflow_execution_logs ENABLE ROW LEVEL SECURITY;

-- 4. Create workflow templates table
CREATE TABLE IF NOT EXISTS workflow_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- 'lead_onboarding', 'follow_up', 'nurturing', 'escalation', 'custom'
    tags TEXT[] DEFAULT '{}',
    template_data JSONB NOT NULL, -- Complete workflow definition
    preview_image TEXT, -- URL to workflow preview image
    usage_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.0,
    is_public BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workflow_templates_category ON workflow_templates(category);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_public ON workflow_templates(is_public);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_rating ON workflow_templates(rating);
ALTER TABLE workflow_templates ENABLE ROW LEVEL SECURITY;

-- 5. Create workflow schedules table
CREATE TABLE IF NOT EXISTS workflow_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID REFERENCES workflow_definitions(id) ON DELETE CASCADE NOT NULL,
    schedule_type TEXT NOT NULL, -- 'cron', 'interval', 'once'
    schedule_expression TEXT NOT NULL, -- Cron expression or interval
    timezone TEXT DEFAULT 'UTC',
    is_active BOOLEAN DEFAULT true,
    last_run_at TIMESTAMP WITH TIME ZONE,
    next_run_at TIMESTAMP WITH TIME ZONE,
    run_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workflow_schedules_workflow ON workflow_schedules(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_schedules_next_run ON workflow_schedules(next_run_at);
CREATE INDEX IF NOT EXISTS idx_workflow_schedules_active ON workflow_schedules(is_active);
ALTER TABLE workflow_schedules ENABLE ROW LEVEL SECURITY;

-- 6. Create workflow webhooks table
CREATE TABLE IF NOT EXISTS workflow_webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID REFERENCES workflow_definitions(id) ON DELETE CASCADE NOT NULL,
    webhook_url TEXT NOT NULL,
    webhook_secret TEXT,
    events TEXT[] DEFAULT '{}', -- Events that trigger this webhook
    is_active BOOLEAN DEFAULT true,
    last_triggered_at TIMESTAMP WITH TIME ZONE,
    trigger_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workflow_webhooks_workflow ON workflow_webhooks(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_webhooks_active ON workflow_webhooks(is_active);
ALTER TABLE workflow_webhooks ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies for Workflow Definitions
CREATE POLICY "workflow_definitions_workspace_access" ON workflow_definitions FOR ALL
USING (
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
    OR organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin','root')
    )
);

-- 8. RLS Policies for Workflow Executions
CREATE POLICY "workflow_executions_workspace_access" ON workflow_executions FOR ALL
USING (
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
    OR organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin','root')
    )
);

-- 9. RLS Policies for Workflow Execution Logs
CREATE POLICY "workflow_execution_logs_workspace_access" ON workflow_execution_logs FOR ALL
USING (
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
    OR organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin','root')
    )
);

-- 10. RLS Policies for Workflow Templates
CREATE POLICY "workflow_templates_public_access" ON workflow_templates FOR SELECT
USING (is_public = true);

CREATE POLICY "workflow_templates_workspace_access" ON workflow_templates FOR ALL
USING (
    created_by = auth.uid()
    OR is_public = true
    OR organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin','root')
    )
);

-- 11. RLS Policies for Workflow Schedules
CREATE POLICY "workflow_schedules_workspace_access" ON workflow_schedules FOR ALL
USING (
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
    OR organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin','root')
    )
);

-- 12. RLS Policies for Workflow Webhooks
CREATE POLICY "workflow_webhooks_workspace_access" ON workflow_webhooks FOR ALL
USING (
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
    OR organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin','root')
    )
);

-- 13. Create function to update workflow execution status
CREATE OR REPLACE FUNCTION update_workflow_execution_status()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        -- Update workflow execution based on logs
        UPDATE workflow_executions SET
            status = CASE 
                WHEN EXISTS (
                    SELECT 1 FROM workflow_execution_logs 
                    WHERE execution_id = COALESCE(NEW.execution_id, OLD.execution_id)
                    AND status = 'failed'
                ) THEN 'failed'
                WHEN EXISTS (
                    SELECT 1 FROM workflow_execution_logs 
                    WHERE execution_id = COALESCE(NEW.execution_id, OLD.execution_id)
                    AND status = 'started'
                    AND NOT EXISTS (
                        SELECT 1 FROM workflow_execution_logs 
                        WHERE execution_id = COALESCE(NEW.execution_id, OLD.execution_id)
                        AND node_id = (SELECT node_id FROM workflow_execution_logs WHERE execution_id = COALESCE(NEW.execution_id, OLD.execution_id) AND status = 'started' ORDER BY started_at DESC LIMIT 1)
                        AND status = 'completed'
                    )
                ) THEN 'running'
                WHEN NOT EXISTS (
                    SELECT 1 FROM workflow_execution_logs 
                    WHERE execution_id = COALESCE(NEW.execution_id, OLD.execution_id)
                    AND status = 'started'
                    AND NOT EXISTS (
                        SELECT 1 FROM workflow_execution_logs 
                        WHERE execution_id = COALESCE(NEW.execution_id, OLD.execution_id)
                        AND node_id = workflow_execution_logs.node_id
                        AND status = 'completed'
                    )
                ) THEN 'completed'
                ELSE status
            END,
            completed_at = CASE 
                WHEN (
                    SELECT COUNT(*) FROM workflow_execution_logs 
                    WHERE execution_id = COALESCE(NEW.execution_id, OLD.execution_id)
                    AND status = 'completed'
                ) = (
                    SELECT COUNT(*) FROM workflow_execution_logs 
                    WHERE execution_id = COALESCE(NEW.execution_id, OLD.execution_id)
                ) AND (
                    SELECT COUNT(*) FROM workflow_execution_logs 
                    WHERE execution_id = COALESCE(NEW.execution_id, OLD.execution_id)
                    AND status = 'failed'
                ) = 0
                THEN NOW()
                ELSE completed_at
            END,
            duration_ms = CASE 
                WHEN completed_at IS NOT NULL THEN 
                    EXTRACT(EPOCH FROM (completed_at - started_at)) * 1000
                ELSE duration_ms
            END
        WHERE id = COALESCE(NEW.execution_id, OLD.execution_id);
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 14. Create trigger for workflow execution status
CREATE TRIGGER update_workflow_execution_status_trigger
    AFTER INSERT OR UPDATE ON workflow_execution_logs
    FOR EACH ROW EXECUTE FUNCTION update_workflow_execution_status();

-- 15. Create function to calculate next run time for scheduled workflows
CREATE OR REPLACE FUNCTION calculate_next_run_time(
    schedule_expression TEXT,
    schedule_type TEXT,
    last_run_at TIMESTAMP WITH TIME ZONE,
    timezone TEXT DEFAULT 'UTC'
) RETURNS TIMESTAMP WITH TIME ZONE AS $$
DECLARE
    next_run TIMESTAMP WITH TIME ZONE;
BEGIN
    CASE schedule_type
        WHEN 'cron' THEN
            -- This would require a cron parser library
            -- For now, return a simple implementation
            next_run := last_run_at + INTERVAL '1 hour';
        WHEN 'interval' THEN
            next_run := last_run_at + schedule_expression::INTERVAL;
        WHEN 'once' THEN
            next_run := NULL;
        ELSE
            next_run := last_run_at + INTERVAL '1 day';
    END CASE;
    
    RETURN next_run;
END;
$$ LANGUAGE plpgsql;

-- 16. Create view for workflow analytics
CREATE OR REPLACE VIEW workflow_analytics AS
SELECT 
    wd.id,
    wd.name,
    wd.status,
    wd.trigger_type,
    wd.category,
    COUNT(we.id) as total_executions,
    COUNT(CASE WHEN we.status = 'completed' THEN 1 END) as successful_executions,
    COUNT(CASE WHEN we.status = 'failed' THEN 1 END) as failed_executions,
    ROUND(AVG(we.duration_ms), 2) as avg_duration_ms,
    MAX(we.started_at) as last_execution,
    wd.workspace_id,
    wd.organization_id,
    wd.created_at
FROM workflow_definitions wd
LEFT JOIN workflow_executions we ON wd.id = we.workflow_id
GROUP BY wd.id, wd.name, wd.status, wd.trigger_type, wd.category, wd.workspace_id, wd.organization_id, wd.created_at;

-- 17. Create view for workflow performance summary
CREATE OR REPLACE VIEW workflow_performance_summary AS
SELECT 
    we.workspace_id,
    we.organization_id,
    DATE_TRUNC('day', we.started_at) as execution_date,
    COUNT(*) as total_executions,
    COUNT(CASE WHEN we.status = 'completed' THEN 1 END) as successful,
    COUNT(CASE WHEN we.status = 'failed' THEN 1 END) as failed,
    COUNT(CASE WHEN we.status = 'running' THEN 1 END) as running,
    ROUND(AVG(we.duration_ms), 2) as avg_duration_ms,
    ROUND(COUNT(CASE WHEN we.status = 'completed' THEN 1 END) * 100.0 / COUNT(*), 2) as success_rate
FROM workflow_executions we
GROUP BY we.workspace_id, we.organization_id, DATE_TRUNC('day', we.started_at);

-- 18. Insert default workflow templates
INSERT INTO workflow_templates (name, description, category, tags, template_data, is_public) VALUES
(
    'Lead Onboarding',
    'Automatically send welcome emails and assign tasks when a new lead is created',
    'lead_onboarding',
    ARRAY['onboarding', 'email', 'automation'],
    '{
        "trigger": {"type": "event_based", "event": "lead_created"},
        "nodes": [
            {"id": "trigger", "type": "trigger", "config": {"event": "lead_created"}},
            {"id": "welcome_email", "type": "email", "config": {"template": "welcome_email"}},
            {"id": "assign_task", "type": "task", "config": {"assign_to": "lead_owner"}}
        ],
        "connections": [
            {"from": "trigger", "to": "welcome_email"},
            {"from": "welcome_email", "to": "assign_task"}
        ]
    }'::jsonb,
    true
),
(
    'Follow-up Sequence',
    'Send follow-up emails and create reminders for leads not contacted',
    'follow_up',
    ARRAY['follow_up', 'email', 'reminders'],
    '{
        "trigger": {"type": "schedule", "schedule": "0 9 * * *"},
        "nodes": [
            {"id": "trigger", "type": "trigger", "config": {"schedule": "0 9 * * *"}},
            {"id": "find_leads", "type": "query", "config": {"status": "fresh", "days_since_creation": 3}},
            {"id": "send_email", "type": "email", "config": {"template": "follow_up_1"}},
            {"id": "create_task", "type": "task", "config": {"due_in": "1 day", "priority": "high"}}
        ],
        "connections": [
            {"from": "trigger", "to": "find_leads"},
            {"from": "find_leads", "to": "send_email"},
            {"from": "send_email", "to": "create_task"}
        ]
    }'::jsonb,
    true
),
(
    'Lead Escalation',
    'Escalate old leads to managers when no contact is made',
    'escalation',
    ARRAY['escalation', 'management', 'alerts'],
    '{
        "trigger": {"type": "schedule", "schedule": "0 10 * * 1"},
        "nodes": [
            {"id": "trigger", "type": "trigger", "config": {"schedule": "0 10 * * 1"}},
            {"id": "find_stale_leads", "type": "query", "config": {"status": "fresh", "days_since_creation": 7}},
            {"id": "notify_manager", "type": "notification", "config": {"message": "Stale leads need attention"}},
            {"id": "reassign_leads", "type": "update", "config": {"assign_to": "manager"}}
        ],
        "connections": [
            {"from": "trigger", "to": "find_stale_leads"},
            {"from": "find_stale_leads", "to": "notify_manager"},
            {"from": "notify_manager", "to": "reassign_leads"}
        ]
    }'::jsonb,
    true
);

-- 19. Add workflow to integrations seed data
INSERT INTO integrations (organization_id, name, type, status, config) 
SELECT 
    id, 
    'Workflow Automation', 
    'workflow', 
    'active', 
    '{"maxConcurrentExecutions": 10, "defaultTimeout": 300000, "retryPolicy": {"maxRetries": 3, "backoffType": "exponential"}, "webhookUrl": "", "webhookSecret": ""}'::jsonb
FROM organizations 
WHERE id NOT IN (
    SELECT organization_id FROM integrations WHERE type = 'workflow'
);

-- 20. Create function to trigger workflow executions
CREATE OR REPLACE FUNCTION trigger_workflow_execution(
    workflow_id UUID,
    trigger_data JSONB,
    triggered_by UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    execution_id UUID;
    execution_uid TEXT;
BEGIN
    -- Generate unique execution ID
    execution_uid := gen_random_uuid()::TEXT;
    
    -- Create workflow execution
    INSERT INTO workflow_executions (
        workflow_id,
        execution_id,
        trigger_data,
        triggered_by,
        workspace_id,
        organization_id
    )
    SELECT 
        workflow_id,
        execution_uid,
        trigger_data,
        triggered_by,
        workspace_id,
        organization_id
    FROM workflow_definitions
    WHERE id = workflow_id
    RETURNING id INTO execution_id;
    
    -- Log trigger start
    INSERT INTO workflow_execution_logs (
        execution_id,
        node_id,
        node_type,
        status,
        input_data,
        workspace_id,
        organization_id
    )
    SELECT 
        execution_id,
        'trigger',
        'trigger',
        'started',
        trigger_data,
        workspace_id,
        organization_id
    FROM workflow_definitions
    WHERE id = workflow_id;
    
    RETURN execution_id;
END;
$$ LANGUAGE plpgsql;

-- Migration complete
SELECT 'Advanced workflows migration completed successfully' as status;
