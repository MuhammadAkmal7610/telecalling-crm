import { supabase, Lead, Campaign, Activity, Workspace } from '../lib/supabase';

export class ApiService {
  private static BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

  private static async request(path: string, options: RequestInit = {}) {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const headers: Record<string, string> = {
        'Authorization': `Bearer ${session?.access_token || ''}`,
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
      };

      const response = await fetch(`${this.BASE_URL}${path}`, {
        ...options,
        headers,
      });

      const result = await response.json();
      
      if (!response.ok) {
        return { data: null, error: { message: result.message || 'API request failed' } };
      }

      return { data: result.data || result, error: null };
    } catch (error: any) {
      console.error(`API Error (${path}):`, error);
      return { data: null, error: { message: error.message } };
    }
  }

  // Leads
  static async getLeads(workspaceId?: string) {
    return this.request('/leads', {
      headers: workspaceId ? { 'x-workspace-id': workspaceId } : {}
    });
  }

  static async createLead(lead: Partial<Lead>) {
    return this.request('/leads', {
      method: 'POST',
      body: JSON.stringify(lead),
      headers: lead.workspace_id ? { 'x-workspace-id': lead.workspace_id } : {}
    });
  }

  static async updateLead(id: string, updates: Partial<Lead>) {
    return this.request(`/leads/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
      headers: updates.workspace_id ? { 'x-workspace-id': updates.workspace_id } : {}
    });
  }

  static async deleteLead(id: string) {
    return this.request(`/leads/${id}`, {
      method: 'DELETE'
    });
  }

  // Campaigns
  static async getCampaigns(workspaceId?: string) {
    return this.request('/campaigns', {
      headers: workspaceId ? { 'x-workspace-id': workspaceId } : {}
    });
  }

  static async createCampaign(campaign: Partial<Campaign>) {
    return this.request('/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaign),
      headers: campaign.workspace_id ? { 'x-workspace-id': campaign.workspace_id } : {}
    });
  }

  // Activities
  static async getActivities(leadId?: string, workspaceId?: string) {
    let path = '/activities?limit=50';
    if (leadId) path += `&lead_id=${leadId}`;
    
    return this.request(path, {
      headers: workspaceId ? { 'x-workspace-id': workspaceId } : {}
    });
  }

  static async createActivity(activity: Partial<Activity>) {
    return this.request('/activities', {
      method: 'POST',
      body: JSON.stringify(activity),
      headers: activity.workspace_id ? { 'x-workspace-id': activity.workspace_id } : {}
    });
  }

  // Workspaces
  static async getWorkspaces(organizationId: string) {
    return this.request('/workspaces');
  }

  static async createWorkspace(workspace: Partial<Workspace>) {
    return this.request('/workspaces', {
      method: 'POST',
      body: JSON.stringify(workspace)
    });
  }

  // ── Email Campaigns ──────────────────────────────────────────────────────────

  static async getEmailCampaigns(workspaceId?: string, status?: string) {
    let path = '/email/campaigns';
    const params: string[] = [];
    if (status) params.push(`status=${status}`);
    if (params.length) path += `?${params.join('&')}`;
    return this.request(path, {
      headers: workspaceId ? { 'x-workspace-id': workspaceId } : {},
    });
  }

  static async createEmailCampaign(data: Record<string, any>) {
    return this.request('/email/campaigns', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: data.workspace_id ? { 'x-workspace-id': data.workspace_id } : {},
    });
  }

  static async updateEmailCampaign(id: string, data: Record<string, any>) {
    return this.request(`/email/campaigns/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: data.workspace_id ? { 'x-workspace-id': data.workspace_id } : {},
    });
  }

  static async executeEmailCampaign(id: string, workspaceId?: string) {
    return this.request(`/email/campaigns/${id}/execute`, {
      method: 'POST',
      headers: workspaceId ? { 'x-workspace-id': workspaceId } : {},
    });
  }

  // ── Email Templates ──────────────────────────────────────────────────────────

  static async getEmailTemplates(workspaceId?: string) {
    return this.request('/email/templates', {
      headers: workspaceId ? { 'x-workspace-id': workspaceId } : {},
    });
  }

  static async createEmailTemplate(data: Record<string, any>) {
    return this.request('/email/templates', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: data.workspace_id ? { 'x-workspace-id': data.workspace_id } : {},
    });
  }

  static async updateEmailTemplate(id: string, data: Record<string, any>) {
    return this.request(`/email/templates/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: data.workspace_id ? { 'x-workspace-id': data.workspace_id } : {},
    });
  }

  static async deleteEmailTemplate(id: string, workspaceId?: string) {
    return this.request(`/email/templates/${id}`, {
      method: 'DELETE',
      headers: workspaceId ? { 'x-workspace-id': workspaceId } : {},
    });
  }

  // ── Email Analytics ──────────────────────────────────────────────────────────

  static async getEmailAnalytics(workspaceId?: string) {
    return this.request('/email/analytics', {
      headers: workspaceId ? { 'x-workspace-id': workspaceId } : {},
    });
  }

  // Dashboard Stats
  static async getDashboardStats(workspaceId?: string) {
    const { data, error } = await this.request('/reports/dashboard', {
      headers: workspaceId ? { 'x-workspace-id': workspaceId } : {}
    });

    if (error || !data) {
      return {
        totalLeads: 0,
        newLeads: 0,
        contactedLeads: 0,
        convertedLeads: 0,
        totalCampaigns: 0,
        activeCampaigns: 0,
      };
    }

    return data;
  }
}
