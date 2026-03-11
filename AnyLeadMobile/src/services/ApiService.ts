import { supabase, Lead, Campaign, Activity, Workspace } from '../lib/supabase';

export class ApiService {
  // Leads
  static async getLeads(workspaceId?: string) {
    let query = supabase.from('leads').select('*');
    if (workspaceId) {
      query = query.eq('workspace_id', workspaceId);
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    return { data, error };
  }

  static async createLead(lead: Partial<Lead>) {
    const { data, error } = await supabase
      .from('leads')
      .insert(lead)
      .select()
      .single();
    return { data, error };
  }

  static async updateLead(id: string, updates: Partial<Lead>) {
    const { data, error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  }

  static async deleteLead(id: string) {
    const { error } = await supabase.from('leads').delete().eq('id', id);
    return { error };
  }

  // Campaigns
  static async getCampaigns(workspaceId?: string) {
    let query = supabase.from('campaigns').select('*');
    if (workspaceId) {
      query = query.eq('workspace_id', workspaceId);
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    return { data, error };
  }

  static async createCampaign(campaign: Partial<Campaign>) {
    const { data, error } = await supabase
      .from('campaigns')
      .insert(campaign)
      .select()
      .single();
    return { data, error };
  }

  // Activities
  static async getActivities(leadId?: string, workspaceId?: string) {
    let query = supabase
      .from('activities')
      .select('*, user:users(name)')
      .order('created_at', { ascending: false });
    
    if (leadId) {
      query = query.eq('lead_id', leadId);
    }
    if (workspaceId) {
      query = query.eq('workspace_id', workspaceId);
    }
    
    const { data, error } = await query.limit(50);
    return { data, error };
  }

  static async createActivity(activity: Partial<Activity>) {
    const { data, error } = await supabase
      .from('activities')
      .insert(activity)
      .select()
      .single();
    return { data, error };
  }

  // Workspaces
  static async getWorkspaces(organizationId: string) {
    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });
    return { data, error };
  }

  static async createWorkspace(workspace: Partial<Workspace>) {
    const { data, error } = await supabase
      .from('workspaces')
      .insert(workspace)
      .select()
      .single();
    return { data, error };
  }

  // Dashboard Stats
  static async getDashboardStats(workspaceId?: string) {
    const stats = {
      totalLeads: 0,
      newLeads: 0,
      contactedLeads: 0,
      convertedLeads: 0,
      totalCampaigns: 0,
      activeCampaigns: 0,
    };

    try {
      // Lead stats
      let leadsQuery = supabase.from('leads').select('status');
      if (workspaceId) {
        leadsQuery = leadsQuery.eq('workspace_id', workspaceId);
      }
      const { data: leads } = await leadsQuery;

      if (leads) {
        stats.totalLeads = leads.length;
        stats.newLeads = leads.filter(l => l.status === 'new').length;
        stats.contactedLeads = leads.filter(l => l.status === 'contacted').length;
        stats.convertedLeads = leads.filter(l => l.status === 'converted').length;
      }

      // Campaign stats
      let campaignsQuery = supabase.from('campaigns').select('status');
      if (workspaceId) {
        campaignsQuery = campaignsQuery.eq('workspace_id', workspaceId);
      }
      const { data: campaigns } = await campaignsQuery;

      if (campaigns) {
        stats.totalCampaigns = campaigns.length;
        stats.activeCampaigns = campaigns.filter(c => c.status === 'active').length;
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }

    return stats;
  }
}
