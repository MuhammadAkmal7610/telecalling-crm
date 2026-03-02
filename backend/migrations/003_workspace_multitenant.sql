-- ============================================================
-- Migration 003: Multi-Tenant Workspace Architecture
-- Organization > Workspace > [Users, Leads, Tasks, Campaigns]
-- ============================================================

-- 1. Workspaces table
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
-- Ensure all columns exist even if the table was created by an older script
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT FALSE;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_workspaces_org ON workspaces(organization_id);
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

-- 2. Workspace members (role scoped per workspace)
CREATE TABLE IF NOT EXISTS workspace_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    role TEXT DEFAULT 'caller', -- 'root','admin','manager','caller','marketing'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(workspace_id, user_id)
);
-- Ensure role column exists if table was pre-created without it
ALTER TABLE workspace_members ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'caller';

CREATE INDEX IF NOT EXISTS idx_ws_members_ws ON workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_ws_members_user ON workspace_members(user_id);
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;

-- 3. Add workspace_id to all data tables (nullable for safe migration from v0)
ALTER TABLE leads      ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL;
ALTER TABLE tasks      ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL;
ALTER TABLE campaigns  ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_leads_workspace     ON leads(workspace_id);
CREATE INDEX IF NOT EXISTS idx_tasks_workspace     ON tasks(workspace_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_workspace ON campaigns(workspace_id);
CREATE INDEX IF NOT EXISTS idx_activities_workspace ON activities(workspace_id);

-- 4. Backfill: auto-create default workspace for each existing org
INSERT INTO workspaces (organization_id, name, is_default)
SELECT id, name || ' - Default', true
FROM organizations
WHERE id NOT IN (SELECT DISTINCT organization_id FROM workspaces);

-- 5. Backfill: set workspace_id on existing data rows
UPDATE leads SET workspace_id = (
    SELECT id FROM workspaces WHERE organization_id = leads.organization_id AND is_default = true LIMIT 1
) WHERE workspace_id IS NULL AND organization_id IS NOT NULL;

UPDATE tasks SET workspace_id = (
    SELECT id FROM workspaces WHERE organization_id = tasks.organization_id AND is_default = true LIMIT 1
) WHERE workspace_id IS NULL AND organization_id IS NOT NULL;

UPDATE campaigns SET workspace_id = (
    SELECT id FROM workspaces WHERE organization_id = campaigns.organization_id AND is_default = true LIMIT 1
) WHERE workspace_id IS NULL AND organization_id IS NOT NULL;

UPDATE activities SET workspace_id = (
    SELECT id FROM workspaces WHERE organization_id = activities.organization_id AND is_default = true LIMIT 1
) WHERE workspace_id IS NULL AND organization_id IS NOT NULL;

-- 6. Backfill: auto-add existing users as workspace members
INSERT INTO workspace_members (workspace_id, user_id, role)
SELECT w.id, u.id, u.role
FROM users u
JOIN workspaces w ON w.organization_id = u.organization_id AND w.is_default = true
WHERE NOT EXISTS (
    SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = w.id AND wm.user_id = u.id
);

-- 7. RLS Policies — Workspaces
DROP POLICY IF EXISTS "ws_member_select" ON workspaces;
CREATE POLICY "ws_member_select" ON workspaces FOR SELECT
  USING (
    id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
    OR organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin','root')
    )
  );

DROP POLICY IF EXISTS "ws_admin_insert" ON workspaces;
CREATE POLICY "ws_admin_insert" ON workspaces FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin','root')
    )
  );

DROP POLICY IF EXISTS "ws_admin_update" ON workspaces;
CREATE POLICY "ws_admin_update" ON workspaces FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin','root')
    )
  );

DROP POLICY IF EXISTS "ws_admin_delete" ON workspaces;
CREATE POLICY "ws_admin_delete" ON workspaces FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin','root')
    )
  );

-- 8. RLS Policies — Workspace Members
DROP POLICY IF EXISTS "ws_members_select" ON workspace_members;
CREATE POLICY "ws_members_select" ON workspace_members FOR SELECT
  USING (
    user_id = auth.uid()
    OR workspace_id IN (
      SELECT wm.workspace_id FROM workspace_members wm
      JOIN users u ON u.id = auth.uid() AND u.role IN ('admin','root')
      WHERE wm.workspace_id = workspace_members.workspace_id
    )
  );

-- 9. RLS Policies — Leads (workspace-scoped)
DROP POLICY IF EXISTS "ws_leads_access" ON leads;
CREATE POLICY "ws_leads_access" ON leads FOR ALL
  USING (
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
    OR organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin','root')
    )
  );

-- 10. RLS Policies — Tasks
DROP POLICY IF EXISTS "ws_tasks_access" ON tasks;
CREATE POLICY "ws_tasks_access" ON tasks FOR ALL
  USING (
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
    OR organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin','root')
    )
  );

-- 11. Org-level user isolation
DROP POLICY IF EXISTS "org_users_access" ON users;
CREATE POLICY "org_users_access" ON users FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );
