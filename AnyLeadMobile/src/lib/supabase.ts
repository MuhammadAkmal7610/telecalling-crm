import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  organization_id: string;
  workspace_id?: string;
}

export interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  alt_phone?: string;
  company?: string;
  notes?: string;
  status: string;
  source: string;
  assignee_id?: string;
  campaign_id?: string;
  organization_id: string;
  workspace_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: string;
  priority: string;
  organization_id: string;
  workspace_id?: string;
  created_by: string;
  progress?: number;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  lead_id: string;
  user_id: string;
  type: string;
  details: string;
  metadata?: any;
  organization_id: string;
  workspace_id?: string;
  created_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  organization_id: string;
  created_at: string;
}

export interface Organization {
  id: string;
  name: string;
  created_at: string;
}
