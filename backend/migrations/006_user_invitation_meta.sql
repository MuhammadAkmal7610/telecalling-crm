-- Migration 006: Repair Users Table Schema
-- Ensures all columns used by AuthService and UsersService exist

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS initials TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'caller';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Working';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS license_type TEXT DEFAULT 'Free';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS license_expiry TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS permission_template_id UUID REFERENCES public.permission_templates(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_invited_by ON public.users(invited_by);
CREATE INDEX IF NOT EXISTS idx_users_permission_template ON public.users(permission_template_id);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
