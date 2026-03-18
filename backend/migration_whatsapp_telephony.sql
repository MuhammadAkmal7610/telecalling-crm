-- ============================================================
-- WhatsApp Integration Migration
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Create WhatsApp messages table
CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_id TEXT, -- WhatsApp message ID
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    message TEXT,
    type TEXT DEFAULT 'text', -- 'text', 'image', 'document', 'template'
    status TEXT DEFAULT 'sent', -- 'sent', 'delivered', 'read', 'failed', 'received'
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    template_name TEXT,
    media_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_workspace ON whatsapp_messages(workspace_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_lead ON whatsapp_messages(lead_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_external ON whatsapp_messages(external_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_from ON whatsapp_messages("from");
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- 2. Create WhatsApp conversations table
CREATE TABLE IF NOT EXISTS whatsapp_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number TEXT NOT NULL,
    contact_name TEXT,
    status TEXT DEFAULT 'active', -- 'active', 'inactive', 'archived'
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_content TEXT,
    unread_count INTEGER DEFAULT 0,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(workspace_id, phone_number)
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_conversations_workspace ON whatsapp_conversations(workspace_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_conversations_phone ON whatsapp_conversations(phone_number);
CREATE INDEX IF NOT EXISTS idx_whatsapp_conversations_lead ON whatsapp_conversations(lead_id);
ALTER TABLE whatsapp_conversations ENABLE ROW LEVEL SECURITY;

-- 3. Create WhatsApp templates table
CREATE TABLE IF NOT EXISTS whatsapp_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- 'MARKETING', 'UTILITY', 'AUTHENTICATION'
    language TEXT DEFAULT 'en',
    components JSONB DEFAULT '[]',
    status TEXT DEFAULT 'pending', -- 'approved', 'pending', 'rejected'
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(workspace_id, name)
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_workspace ON whatsapp_templates(workspace_id);
ALTER TABLE whatsapp_templates ENABLE ROW LEVEL SECURITY;

-- 4. Create calls table for telephony
CREATE TABLE IF NOT EXISTS calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    twilio_call_sid TEXT,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
    agent_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'initiated', -- 'initiated', 'connected', 'missed', 'voicemail', 'ended'
    direction TEXT DEFAULT 'outbound', -- 'inbound', 'outbound'
    duration INTEGER DEFAULT 0, -- in seconds
    recording_url TEXT,
    transcript TEXT,
    notes TEXT,
    call_status TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_calls_workspace ON calls(workspace_id);
CREATE INDEX IF NOT EXISTS idx_calls_lead ON calls(lead_id);
CREATE INDEX IF NOT EXISTS idx_calls_agent ON calls(agent_id);
CREATE INDEX IF NOT EXISTS idx_calls_twilio ON calls(twilio_call_sid);
CREATE INDEX IF NOT EXISTS idx_calls_status ON calls(status);
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for WhatsApp Messages
CREATE POLICY "whatsapp_messages_workspace_access" ON whatsapp_messages FOR ALL
USING (
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
    OR organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin','root')
    )
);

-- 6. RLS Policies for WhatsApp Conversations
CREATE POLICY "whatsapp_conversations_workspace_access" ON whatsapp_conversations FOR ALL
USING (
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
    OR organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin','root')
    )
);

-- 7. RLS Policies for WhatsApp Templates
CREATE POLICY "whatsapp_templates_workspace_access" ON whatsapp_templates FOR ALL
USING (
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
    OR organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin','root')
    )
);

-- 8. RLS Policies for Calls
CREATE POLICY "calls_workspace_access" ON calls FOR ALL
USING (
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
    OR organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin','root')
    )
);

-- 9. Agent can see their own calls
CREATE POLICY "calls_own_agent_access" ON calls FOR SELECT
USING (
    agent_id = auth.uid()
    OR workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid() AND role IN ('admin','manager','root'))
);

-- 10. Update activities table to include call and message references
ALTER TABLE activities 
ADD COLUMN IF NOT EXISTS call_id UUID REFERENCES calls(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS whatsapp_message_id UUID REFERENCES whatsapp_messages(id) ON DELETE SET NULL;

-- 11. Create analytics_events table for advanced analytics
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT NOT NULL, -- 'lead_created', 'call_completed', 'message_sent', etc.
    entity_type TEXT NOT NULL, -- 'lead', 'call', 'message', 'user'
    entity_id TEXT NOT NULL,
    properties JSONB DEFAULT '{}',
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_workspace ON analytics_events(workspace_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- 12. RLS Policy for Analytics Events
CREATE POLICY "analytics_events_workspace_access" ON analytics_events FOR ALL
USING (
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
    OR organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin','root')
    )
);

-- 13. Create function to automatically create analytics events
CREATE OR REPLACE FUNCTION create_analytics_event()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO analytics_events (
        event_type,
        entity_type,
        entity_id,
        properties,
        user_id,
        workspace_id,
        organization_id,
        timestamp
    ) VALUES (
        TG_OP || '_' || TG_TABLE_NAME,
        TG_TABLE_NAME,
        COALESCE(NEW.id::TEXT, OLD.id::TEXT),
        row_to_json(COALESCE(NEW, OLD)),
        COALESCE(NEW.created_by, OLD.created_by, NEW.agent_id, OLD.agent_id),
        COALESCE(NEW.workspace_id, OLD.workspace_id),
        COALESCE(NEW.organization_id, OLD.organization_id),
        NOW()
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 14. Create triggers for automatic analytics
CREATE TRIGGER analytics_leads_trigger
    AFTER INSERT OR UPDATE OR DELETE ON leads
    FOR EACH ROW EXECUTE FUNCTION create_analytics_event();

CREATE TRIGGER analytics_calls_trigger
    AFTER INSERT OR UPDATE OR DELETE ON calls
    FOR EACH ROW EXECUTE FUNCTION create_analytics_event();

CREATE TRIGGER analytics_whatsapp_messages_trigger
    AFTER INSERT OR UPDATE OR DELETE ON whatsapp_messages
    FOR EACH ROW EXECUTE FUNCTION create_analytics_event();

-- 15. Add WhatsApp to integrations seed data
INSERT INTO integrations (organization_id, name, type, status, config) 
SELECT 
    id, 
    'WhatsApp Business', 
    'whatsapp', 
    'inactive', 
    '{"provider": "direct", "phoneNumberId": "", "accessToken": "", "webhookUrl": "", "webhookSecret": ""}'::jsonb
FROM organizations 
WHERE id NOT IN (
    SELECT organization_id FROM integrations WHERE type = 'whatsapp'
);

-- 16. Add Twilio to integrations seed data
INSERT INTO integrations (organization_id, name, type, status, config) 
SELECT 
    id, 
    'Twilio', 
    'twilio', 
    'inactive', 
    '{"accountSid": "", "authToken": "", "apiKey": "", "apiSecret": "", "voiceApplicationSid": "", "phoneNumber": ""}'::jsonb
FROM organizations 
WHERE id NOT IN (
    SELECT organization_id FROM integrations WHERE type = 'twilio'
);

-- 17. Create function to update conversation last message
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE whatsapp_conversations 
    SET 
        last_message_at = NEW.created_at,
        last_message_content = NEW.message,
        unread_count = CASE 
            WHEN NEW.status = 'received' THEN unread_count + 1
            ELSE unread_count
        END,
        updated_at = NOW()
    WHERE phone_number = NEW."from" AND workspace_id = NEW.workspace_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 18. Create trigger for conversation updates
CREATE TRIGGER update_conversation_trigger
    AFTER INSERT ON whatsapp_messages
    FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();

-- 19. Create view for conversation summary
CREATE OR REPLACE VIEW conversation_summary AS
SELECT 
    wc.id,
    wc.phone_number,
    wc.contact_name,
    wc.status,
    wc.last_message_at,
    wc.last_message_content,
    wc.unread_count,
    wc.workspace_id,
    wc.organization_id,
    wc.lead_id,
    l.name as lead_name,
    l.status as lead_status,
    l.assignee_id,
    assignee.name as assignee_name,
    COUNT(wm.id) as message_count
FROM whatsapp_conversations wc
LEFT JOIN leads l ON wc.lead_id = l.id
LEFT JOIN users assignee ON l.assignee_id = assignee.id
LEFT JOIN whatsapp_messages wm ON wc.phone_number = wm."from" AND wm.workspace_id = wc.workspace_id
GROUP BY wc.id, l.name, l.status, l.assignee_id, assignee.name;

-- 20. Create view for call analytics
CREATE OR REPLACE VIEW call_analytics_summary AS
SELECT 
    c.workspace_id,
    DATE_TRUNC('day', c.started_at) as call_date,
    COUNT(*) as total_calls,
    COUNT(CASE WHEN c.status = 'connected' THEN 1 END) as connected_calls,
    COUNT(CASE WHEN c.status = 'missed' THEN 1 END) as missed_calls,
    AVG(c.duration) as avg_duration,
    SUM(c.duration) as total_duration,
    COUNT(CASE WHEN c.direction = 'inbound' THEN 1 END) as inbound_calls,
    COUNT(CASE WHEN c.direction = 'outbound' THEN 1 END) as outbound_calls
FROM calls c
GROUP BY c.workspace_id, DATE_TRUNC('day', c.started_at);

-- Migration complete
SELECT 'WhatsApp and Telephony integration migration completed successfully' as status;
