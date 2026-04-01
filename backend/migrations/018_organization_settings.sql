-- Migration 018: Create Organization Settings Table
-- This table stores organization-level settings including invitation settings

CREATE TABLE IF NOT EXISTS public.organization_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL UNIQUE REFERENCES public.organizations(id) ON DELETE CASCADE,
    invitation_settings JSONB DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for organization lookups
CREATE INDEX IF NOT EXISTS idx_organization_settings_organization ON public.organization_settings(organization_id);

-- Default invitation settings structure:
-- {
--     "defaultExpiryDays": 7,
--     "autoReminders": true,
--     "requireApproval": false,
--     "defaultRole": "caller",
--     "emailTemplate": null
-- }