-- ============================================================
-- Migration 013: Full Replica Parity
-- This script adds missing columns and tables to bridge the gap 
-- between earlier migrations and the full TeleCRM.in feature set.
-- ============================================================

-- 1. BILLING & SUBSCRIPTIONS (Entirely New)
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    stripe_plan_id TEXT UNIQUE,
    price DECIMAL(10,2) NOT NULL,
    billing_interval TEXT NOT NULL,
    features JSONB NOT NULL,
    limits JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS billing_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
    plan_id UUID REFERENCES subscription_plans(id) ON DELETE SET NULL,
    plan TEXT DEFAULT 'free',
    status TEXT NOT NULL DEFAULT 'active',
    limits JSONB DEFAULT '{"leads": 100, "users": 2}',
    stripe_subscription_id TEXT UNIQUE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, workspace_id)
);

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    status TEXT DEFAULT 'success',
    type TEXT DEFAULT 'subscription',
    stripe_payment_intent_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. WHATSAPP & TELEPHONY (Entirely New)
CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_id TEXT,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    message TEXT,
    type TEXT DEFAULT 'text',
    status TEXT DEFAULT 'sent',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    template_name TEXT,
    media_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS whatsapp_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number TEXT NOT NULL,
    contact_name TEXT,
    status TEXT DEFAULT 'active',
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

CREATE TABLE IF NOT EXISTS whatsapp_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    language TEXT DEFAULT 'en',
    components JSONB DEFAULT '[]',
    status TEXT DEFAULT 'pending',
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(workspace_id, name)
);

CREATE TABLE IF NOT EXISTS calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    twilio_call_sid TEXT,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
    agent_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'initiated',
    direction TEXT DEFAULT 'outbound',
    duration INTEGER DEFAULT 0,
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

-- 3. ANALYTICS (Entirely New)
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    properties JSONB DEFAULT '{}',
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ENHANCING EXISTING TABLES (Safe Alters)
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS billing_config JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

ALTER TABLE email_campaigns
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS schedule_type TEXT DEFAULT 'immediate',
ADD COLUMN IF NOT EXISTS target_audience JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS reply_to_email TEXT,
ADD COLUMN IF NOT EXISTS track_opens BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS track_clicks BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS bounced_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS unsubscribed_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE email_logs
ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS bounced_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS tracking_id TEXT,
ADD COLUMN IF NOT EXISTS variables_used JSONB DEFAULT '{}';

-- 5. FUNCTIONS & TRIGGERS
CREATE OR REPLACE FUNCTION create_analytics_event()
RETURNS TRIGGER AS $$
DECLARE
    v_new_json JSONB;
    v_old_json JSONB;
BEGIN
    v_new_json := row_to_json(NEW)::JSONB;
    v_old_json := row_to_json(OLD)::JSONB;
    
    INSERT INTO analytics_events (
        event_type, entity_type, entity_id, properties, user_id, 
        workspace_id, organization_id, timestamp
    ) VALUES (
        TG_OP || '_' || TG_TABLE_NAME, TG_TABLE_NAME,
        COALESCE((v_new_json->>'id'), (v_old_json->>'id')),
        COALESCE(v_new_json, v_old_json),
        COALESCE((v_new_json->>'created_by')::UUID, (v_new_json->>'agent_id')::UUID, auth.uid()),
        COALESCE((v_new_json->>'workspace_id')::UUID, (v_old_json->>'workspace_id')::UUID),
        COALESCE((v_new_json->>'organization_id')::UUID, (v_old_json->>'organization_id')::UUID),
        NOW()
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS analytics_leads_trigger ON leads;
CREATE TRIGGER analytics_leads_trigger AFTER INSERT OR UPDATE OR DELETE ON leads FOR EACH ROW EXECUTE FUNCTION create_analytics_event();

DROP TRIGGER IF EXISTS analytics_calls_trigger ON calls;
CREATE TRIGGER analytics_calls_trigger AFTER INSERT OR UPDATE OR DELETE ON calls FOR EACH ROW EXECUTE FUNCTION create_analytics_event();

CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE whatsapp_conversations 
    SET last_message_at = NEW.created_at, last_message_content = NEW.message,
        unread_count = CASE WHEN NEW.status = 'received' THEN unread_count + 1 ELSE unread_count END,
        updated_at = NOW()
    WHERE phone_number = NEW."from" AND workspace_id = NEW.workspace_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_conversation_trigger ON whatsapp_messages;
CREATE TRIGGER update_conversation_trigger AFTER INSERT ON whatsapp_messages FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();

-- 6. VIEWS
DROP VIEW IF EXISTS conversation_summary CASCADE;
CREATE OR REPLACE VIEW conversation_summary AS
SELECT wc.*, l.name as lead_name, l.status as lead_status, l.assignee_id, u.name as assignee_name
FROM whatsapp_conversations wc
LEFT JOIN leads l ON wc.lead_id = l.id
LEFT JOIN users u ON l.assignee_id = u.id;

-- 7. RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Migration complete
SELECT 'Full Parity Migration 013 executed successfully' as status;
