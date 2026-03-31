-- Step 1: Create lead_lists table (Stores the collections)
CREATE TABLE IF NOT EXISTS public.lead_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT 'bg-teal-50 text-teal-600 border-teal-100',
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Step 2: Create list_leads junction table (Links leads to collections)
CREATE TABLE IF NOT EXISTS public.list_leads (
  list_id UUID REFERENCES public.lead_lists(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  PRIMARY KEY (list_id, lead_id)
);

-- Step 3: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_lead_lists_workspace ON public.lead_lists(workspace_id);
CREATE INDEX IF NOT EXISTS idx_list_leads_lead ON public.list_leads(lead_id);
