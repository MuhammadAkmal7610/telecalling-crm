-- Migration: Create lead_lists and junction table
-- Run this in your Supabase SQL Editor or via the migration script

CREATE TABLE IF NOT EXISTS lead_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT 'bg-teal-50 text-teal-600 border-teal-100',
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS list_leads (
    list_id UUID REFERENCES lead_lists(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (list_id, lead_id)
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_lead_lists_workspace ON lead_lists(workspace_id);
CREATE INDEX IF NOT EXISTS idx_list_leads_lead ON list_leads(lead_id);
CREATE INDEX IF NOT EXISTS idx_list_leads_list ON list_leads(list_id);
