-- ============================================================
-- Multi-Tenant Migration: Organization > Workspace
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Create workspaces table
CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    slug TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    settings JSONB DEFAULT '{}',
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_workspaces_org ON workspaces(organization_id);
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

-- 2. User-Workspace membership (role scoped per workspace)
CREATE TABLE IF NOT EXISTS workspace_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    role TEXT DEFAULT 'caller', -- 'root','admin','manager','caller','marketing'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(workspace_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_ws_members_ws ON workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_ws_members_user ON workspace_members(user_id);
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;

-- 3. Add workspace_id to all data tables (nullable for safe migration)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_leads_workspace ON leads(workspace_id);
CREATE INDEX IF NOT EXISTS idx_tasks_workspace ON tasks(workspace_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_workspace ON campaigns(workspace_id);

-- 4. Auto-create a default workspace for every existing organization
INSERT INTO workspaces (organization_id, name, is_default)
SELECT id, name || ' - Default', true
FROM organizations
WHERE id NOT IN (
    SELECT DISTINCT organization_id FROM workspaces
);

-- 5. Backfill workspace_id for existing data using each org's default workspace
UPDATE leads SET workspace_id = (
    SELECT id FROM workspaces
    WHERE organization_id = leads.organization_id
      AND is_default = true
    LIMIT 1
) WHERE workspace_id IS NULL;

UPDATE tasks SET workspace_id = (
    SELECT id FROM workspaces
    WHERE organization_id = tasks.organization_id
      AND is_default = true
    LIMIT 1
) WHERE workspace_id IS NULL;

UPDATE campaigns SET workspace_id = (
    SELECT id FROM workspaces
    WHERE organization_id = campaigns.organization_id
      AND is_default = true
    LIMIT 1
) WHERE workspace_id IS NULL;

UPDATE activities SET workspace_id = (
    SELECT id FROM workspaces
    WHERE organization_id = activities.organization_id
      AND is_default = true
    LIMIT 1
) WHERE workspace_id IS NULL;

-- 6. Auto-add all existing users as members of their org's default workspace
INSERT INTO workspace_members (workspace_id, user_id, role)
SELECT w.id, u.id, u.role
FROM users u
JOIN workspaces w ON w.organization_id = u.organization_id AND w.is_default = true
WHERE NOT EXISTS (
    SELECT 1 FROM workspace_members wm
    WHERE wm.workspace_id = w.id AND wm.user_id = u.id
);

-- 7. RLS Policies

-- Workspaces: members see their workspaces; org admins see all
CREATE POLICY "ws_member_select" ON workspaces FOR SELECT
  USING (
    id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
    OR organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin','root')
    )
  );

CREATE POLICY "ws_admin_insert" ON workspaces FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin','root')
    )
  );

CREATE POLICY "ws_admin_update" ON workspaces FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin','root')
    )
  );

CREATE POLICY "ws_admin_delete" ON workspaces FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin','root')
    )
  );

-- Workspace members: see own membership; admins see all in org
CREATE POLICY "ws_members_select" ON workspace_members FOR SELECT
  USING (
    user_id = auth.uid()
    OR workspace_id IN (
      SELECT wm.workspace_id FROM workspace_members wm
      JOIN users u ON u.id = auth.uid() AND u.role IN ('admin','root')
      WHERE wm.workspace_id = workspace_members.workspace_id
    )
  );

-- Leads: scoped to workspace membership
CREATE POLICY "ws_leads_access" ON leads FOR ALL
  USING (
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
    OR organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin','root')
    )
  );

-- Callers see only assigned leads within their workspace
CREATE POLICY "caller_own_leads" ON leads FOR SELECT
  USING (
    assignee_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM workspace_members
      WHERE user_id = auth.uid()
        AND workspace_id = leads.workspace_id
        AND role IN ('admin','manager','root','marketing')
    )
  );

-- Tasks: workspace-scoped
CREATE POLICY "ws_tasks_access" ON tasks FOR ALL
  USING (
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
    OR organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin','root')
    )
  );

-- Org-level user isolation still applies
CREATE POLICY "org_users_access" ON users FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );
