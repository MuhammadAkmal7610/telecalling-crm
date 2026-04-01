-- Migration 019: Create Invite Links Table
-- This table stores shareable invitation links for team member onboarding

CREATE TABLE IF NOT EXISTS public.invite_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'caller',
    token TEXT NOT NULL UNIQUE,
    max_uses INTEGER DEFAULT NULL,
    uses_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for token lookups
CREATE INDEX IF NOT EXISTS idx_invite_links_token ON public.invite_links(token);

-- Index for organization lookups
CREATE INDEX IF NOT EXISTS idx_invite_links_organization ON public.invite_links(organization_id);

-- Index for active links
CREATE INDEX IF NOT EXISTS idx_invite_links_active ON public.invite_links(is_active) WHERE is_active = true;