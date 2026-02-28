-- RESTRICTED DB RESTRUCTURING SCRIPT
-- Organization -> Workspaces -> [Users, Leads, Deals, Tasks]

-- 1. Create Workspaces Table
CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_workspaces_org ON workspaces(organization_id);
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

-- 2. Create Deals Table
CREATE TABLE IF NOT EXISTS deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    value DECIMAL(12, 2) DEFAULT 0,
    status TEXT DEFAULT 'open', -- 'open', 'won', 'lost'
    expected_close_date DATE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_deals_workspace ON deals(workspace_id);
CREATE INDEX IF NOT EXISTS idx_deals_lead ON deals(lead_id);
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

-- 3. Update Existing Tables with workspace_id
-- We add workspace_id as NULLABLE first to avoid breaking existing data

-- Users
ALTER TABLE users ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_users_workspace ON users(workspace_id);

-- Leads
ALTER TABLE leads ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_leads_workspace ON leads(workspace_id);

-- Tasks
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_workspace ON tasks(workspace_id);

-- Activities
ALTER TABLE activities ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_activities_workspace ON activities(workspace_id);

-- 4. Sample Migration Logic (Optional/Manual)
-- AFTER creating a workspace, you would run:
-- UPDATE users SET workspace_id = 'YOUR_NEW_WORKSPACE_ID' WHERE organization_id = 'YOUR_ORG_ID';
-- And repeat for leads, tasks, etc.

-- 5. Row Level Security Policies (Update templates)
-- Example for Leads:
-- CREATE POLICY "Users can view leads in their workspace" ON leads
-- FOR SELECT USING (workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid()));
