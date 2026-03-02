-- ============================================================
-- Migration 002: Lead Extras & Support Tables
-- ============================================================

-- campaign_id on leads
ALTER TABLE leads ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_leads_campaign ON leads(campaign_id);

-- rating already in 001 but safe with IF NOT EXISTS equivalent via ALTER
ALTER TABLE leads ADD COLUMN IF NOT EXISTS rating INTEGER DEFAULT 0;

-- Lead Field Definitions
CREATE TABLE IF NOT EXISTS lead_field_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    label TEXT NOT NULL,
    type TEXT DEFAULT 'text',
    is_default BOOLEAN DEFAULT FALSE,
    is_searchable BOOLEAN DEFAULT TRUE,
    show_in_import BOOLEAN DEFAULT TRUE,
    show_in_quick_add BOOLEAN DEFAULT TRUE,
    lock_after_create BOOLEAN DEFAULT FALSE,
    can_use_variable BOOLEAN DEFAULT FALSE,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, name)
);
CREATE INDEX IF NOT EXISTS idx_lead_fields_org ON lead_field_definitions(organization_id);

-- Integrations
CREATE TABLE IF NOT EXISTS integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT DEFAULT 'inactive',
    config JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_integrations_org ON integrations(organization_id);

-- Reports
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT DEFAULT 'COMPLETED',
    size TEXT,
    url TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_reports_org ON reports(organization_id);
