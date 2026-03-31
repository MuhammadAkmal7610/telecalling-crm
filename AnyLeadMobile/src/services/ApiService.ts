import { Platform } from 'react-native';
import { supabase, Lead, Campaign, Activity, Workspace } from '../lib/supabase';

export class ApiService {
  private static activeWorkspaceId: string | null = null;

  static setActiveWorkspace(workspaceId: string | null) {
    this.activeWorkspaceId = workspaceId;
  }

  private static getBaseUrl() {
    let url = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
    if (Platform.OS === 'web' && url.includes('10.0.2.2')) {
      return url.replace('10.0.2.2', 'localhost');
    }
    return url;
  }

  private static async request(path: string, options: RequestInit = {}) {
    try {
      // Get session with proper error handling to avoid "Lock broken" issues
      let session;
      try {
        const { data } = await supabase.auth.getSession();
        session = data.session;
      } catch (sessionError) {
        console.warn('Session retrieval failed:', sessionError);
        session = null;
      }

      // If no session, return unauthorized error immediately
      if (!session) {
        return { 
          data: null, 
          error: { 
            message: 'Your session has expired. Please login again.',
            code: 'UNAUTHORIZED'
          } 
        };
      }

      const customHeaders = (options.headers as Record<string, string>) || {};
      if (customHeaders['x-workspace-id'] === 'null' || customHeaders['x-workspace-id'] === 'undefined' || !customHeaders['x-workspace-id']) {
        delete customHeaders['x-workspace-id'];
      }

      const headers: Record<string, string> = {
        'Authorization': `Bearer ${session.access_token || ''}`,
        'Content-Type': 'application/json',
        'x-workspace-id': this.activeWorkspaceId || '',
        ...customHeaders,
      };

      const response = await fetch(`${this.getBaseUrl()}${path}`, {
        ...options,
        headers,
      });

      // Special handling for 401 Unauthorized
      if (response.status === 401) {
        return { 
          data: null, 
          error: { 
            message: 'Your session has expired. Please login again.',
            code: 'UNAUTHORIZED'
          } 
        };
      }

      const result = await response.json();
      
      if (!response.ok) {
        // Extract the best possible error message
        const errorMessage = 
          result.error?.message || 
          result.message || 
          (typeof result === 'string' ? result : 'API request failed');
          
        return { data: null, error: { message: errorMessage } };
      }

      return { data: result.data || result, error: null };
    } catch (error: any) {
      console.error(`API Error (${path}):`, error);
      return { data: null, error: { message: error.message || 'Network error occurred' } };
    }
  }

  static async get(path: string, headers?: Record<string, string>) {
    return this.request(path, { method: 'GET', headers });
  }
  
  static async post(path: string, body?: any, headers?: Record<string, string>) {
    return this.request(path, { 
      method: 'POST', 
      body: body ? JSON.stringify(body) : undefined,
      headers 
    });
  }
  
  static async put(path: string, body?: any, headers?: Record<string, string>) {
    return this.request(path, { 
      method: 'PUT', 
      body: body ? JSON.stringify(body) : undefined,
      headers 
    });
  }
  
  static async patch(path: string, body?: any, headers?: Record<string, string>) {
    return this.request(path, { 
      method: 'PATCH', 
      body: body ? JSON.stringify(body) : undefined,
      headers 
    });
  }
  
  static async delete(path: string, headers?: Record<string, string>) {
    return this.request(path, { method: 'DELETE', headers });
  }

  // Users
  static async getUserProfile() {
    return this.request('/users/me');
  }

  static async updateUser(updates: { workspace_id?: string; name?: string; phone?: string; initials?: string }) {
    return this.request('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  static async getUsers() {
    return this.request('/users');
  }

  // Leads
  static async getLeads(workspaceId?: string) {
    return this.request('/leads', {
      headers: workspaceId ? { 'x-workspace-id': workspaceId } : {}
    });
  }

  static async createLead(lead: Partial<Lead>) {
    const { organization_id, workspace_id, ...payload } = lead as any;
    return this.request('/leads', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: workspace_id ? { 'x-workspace-id': workspace_id } : {}
    });
  }

  static async updateLead(id: string, updates: Partial<Lead>) {
    const { organization_id, workspace_id, ...payload } = updates as any;
    return this.request(`/leads/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
      headers: workspace_id ? { 'x-workspace-id': workspace_id } : {}
    });
  }

  static async deleteLead(id: string) {
    return this.request(`/leads/${id}`, {
      method: 'DELETE'
    });
  }

  static async getLeadFields() {
    return this.request('/lead-fields');
  }

  static async bulkImportLeads(leads: any[], workspaceId?: string) {
    return this.request('/leads/bulk-import', {
      method: 'POST',
      body: JSON.stringify({ leads }),
      headers: workspaceId ? { 'x-workspace-id': workspaceId } : {}
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

  static async getMyWorkspaces() {
    return this.request('/workspaces/my');
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

  static async getDashboardStats(workspaceId?: string) {
    const { data, error } = await this.getDashboardData('week');

    if (error || !data) {
      return {
        totalLeads: 0,
        newLeads: 0,
        contactedLeads: 0,
        convertedLeads: 0,
        totalCampaigns: 0,
        activeCampaigns: 0,
        leadSourceBreakdown: []
      };
    }

    const { metrics } = data;
    return {
      totalLeads: metrics.leads.total ?? 0,
      newLeads: metrics.leads.new ?? 0,
      contactedLeads: metrics.leads.total - metrics.leads.new,
      convertedLeads: Math.round(metrics.leads.total * (metrics.leads.conversion_rate / 100)),
      totalCampaigns: 0, // Not in dashboard data currently
      activeCampaigns: 0,
      leadSourceBreakdown: Object.entries(metrics.leads.by_source || {}).map(([name, value]) => ({ name, value: value as number })),
    };
  }

  // Analytics
  static async getAgentPerformance(timeRange: string = 'month') {
    return this.request(`/analytics/agent-performance?timeRange=${timeRange}`);
  }

  static async getDashboardData(timeRange: string = 'month') {
    return this.request(`/analytics/dashboard?timeRange=${timeRange}`);
  }

  static async getConversionFunnel(timeRange: string = 'month') {
    return this.request(`/analytics/conversion-funnel?timeRange=${timeRange}`);
  }

  static async getTopPerformers(timeRange: string = 'week') {
    return this.request(`/analytics/top-performers?timeRange=${timeRange}`);
  }
}
