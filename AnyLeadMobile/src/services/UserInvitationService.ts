import { ApiService } from './ApiService';

export interface UserInvitation {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'manager' | 'sales' | 'agent' | 'viewer';
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  invitedBy: string;
  invitedByName: string;
  organizationId: string;
  organizationName: string;
  workspaceId?: string;
  workspaceName?: string;
  invitationToken: string;
  invitedAt: string;
  expiresAt: string;
  acceptedAt?: string;
  message?: string;
  permissions: {
    canManageUsers: boolean;
    canManageSettings: boolean;
    canViewReports: boolean;
    canManageLeads: boolean;
    canManageCampaigns: boolean;
  };
}

export interface InviteLink {
  id: string;
  name: string;
  role: 'admin' | 'manager' | 'sales' | 'agent' | 'viewer';
  workspaceId?: string;
  workspaceName?: string;
  link: string;
  isActive: boolean;
  uses: number;
  maxUses?: number;
  expiresAt?: string;
  createdAt: string;
  createdBy: string;
  permissions: {
    canManageUsers: boolean;
    canManageSettings: boolean;
    canViewReports: boolean;
    canManageLeads: boolean;
    canManageCampaigns: boolean;
  };
}

export interface CreateInvitationRequest {
  email: string;
  name?: string;
  role: 'admin' | 'manager' | 'sales' | 'agent' | 'viewer';
  workspaceId?: string;
  message?: string;
  permissions: {
    canManageUsers: boolean;
    canManageSettings: boolean;
    canViewReports: boolean;
    canManageLeads: boolean;
    canManageCampaigns: boolean;
  };
}

export interface CreateInviteLinkRequest {
  name: string;
  role: 'admin' | 'manager' | 'sales' | 'agent' | 'viewer';
  workspaceId?: string;
  maxUses?: number;
  expiresAt?: string;
  permissions: {
    canManageUsers: boolean;
    canManageSettings: boolean;
    canViewReports: boolean;
    canManageLeads: boolean;
    canManageCampaigns: boolean;
  };
}

export class UserInvitationService {
  private static instance: UserInvitationService;

  static getInstance(): UserInvitationService {
    if (!UserInvitationService.instance) {
      UserInvitationService.instance = new UserInvitationService();
    }
    return UserInvitationService.instance;
  }

  // Invitation Management
  async getInvitations(organizationId: string): Promise<UserInvitation[]> {
    try {
      const response = await ApiService.get(`/organizations/${organizationId}/invitations`);
      return response.data;
    } catch (error) {
      console.error('Error fetching invitations:', error);
      throw error;
    }
  }

  async createInvitation(data: CreateInvitationRequest): Promise<UserInvitation> {
    try {
      const response = await ApiService.post('/invitations', data);
      return response.data;
    } catch (error) {
      console.error('Error creating invitation:', error);
      throw error;
    }
  }

  async resendInvitation(invitationId: string): Promise<UserInvitation> {
    try {
      const response = await ApiService.post(`/invitations/${invitationId}/resend`);
      return response.data;
    } catch (error) {
      console.error('Error resending invitation:', error);
      throw error;
    }
  }

  async cancelInvitation(invitationId: string): Promise<UserInvitation> {
    try {
      const response = await ApiService.put(`/invitations/${invitationId}/cancel`);
      return response.data;
    } catch (error) {
      console.error('Error cancelling invitation:', error);
      throw error;
    }
  }

  async deleteInvitation(invitationId: string): Promise<void> {
    try {
      await ApiService.delete(`/invitations/${invitationId}`);
    } catch (error) {
      console.error('Error deleting invitation:', error);
      throw error;
    }
  }

  // Invite Link Management
  async getInviteLinks(organizationId: string): Promise<InviteLink[]> {
    try {
      const response = await ApiService.get(`/organizations/${organizationId}/invite-links`);
      return response.data;
    } catch (error) {
      console.error('Error fetching invite links:', error);
      throw error;
    }
  }

  async createInviteLink(data: CreateInviteLinkRequest): Promise<InviteLink> {
    try {
      const response = await ApiService.post('/invite-links', data);
      return response.data;
    } catch (error) {
      console.error('Error creating invite link:', error);
      throw error;
    }
  }

  async updateInviteLink(linkId: string, data: Partial<CreateInviteLinkRequest>): Promise<InviteLink> {
    try {
      const response = await ApiService.put(`/invite-links/${linkId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating invite link:', error);
      throw error;
    }
  }

  async toggleInviteLink(linkId: string): Promise<InviteLink> {
    try {
      const response = await ApiService.put(`/invite-links/${linkId}/toggle`);
      return response.data;
    } catch (error) {
      console.error('Error toggling invite link:', error);
      throw error;
    }
  }

  async deleteInviteLink(linkId: string): Promise<void> {
    try {
      await ApiService.delete(`/invite-links/${linkId}`);
    } catch (error) {
      console.error('Error deleting invite link:', error);
      throw error;
    }
  }

  // Invitation Validation & Acceptance
  async validateInvitation(token: string): Promise<UserInvitation> {
    try {
      const response = await ApiService.get(`/invitations/validate/${token}`);
      return response.data;
    } catch (error) {
      console.error('Error validating invitation:', error);
      throw error;
    }
  }

  async acceptInvitation(token: string, userId?: string): Promise<void> {
    try {
      await ApiService.post(`/invitations/accept/${token}`, { userId });
    } catch (error) {
      console.error('Error accepting invitation:', error);
      throw error;
    }
  }

  async declineInvitation(token: string): Promise<void> {
    try {
      await ApiService.post(`/invitations/decline/${token}`);
    } catch (error) {
      console.error('Error declining invitation:', error);
      throw error;
    }
  }

  // Invitation Settings
  async getInvitationSettings(organizationId: string): Promise<{
    defaultExpiryDays: number;
    allowPublicLinks: boolean;
    requireEmailVerification: boolean;
    defaultRoleForLinks: string;
    maxInvitationsPerDay: number;
  }> {
    try {
      const response = await ApiService.get(`/organizations/${organizationId}/invitation-settings`);
      return response.data;
    } catch (error) {
      console.error('Error fetching invitation settings:', error);
      throw error;
    }
  }

  async updateInvitationSettings(organizationId: string, settings: {
    defaultExpiryDays?: number;
    allowPublicLinks?: boolean;
    requireEmailVerification?: boolean;
    defaultRoleForLinks?: string;
    maxInvitationsPerDay?: number;
  }): Promise<void> {
    try {
      await ApiService.put(`/organizations/${organizationId}/invitation-settings`, settings);
    } catch (error) {
      console.error('Error updating invitation settings:', error);
      throw error;
    }
  }

  // Analytics
  async getInvitationAnalytics(organizationId: string): Promise<{
    totalInvitations: number;
    pendingInvitations: number;
    acceptedInvitations: number;
    expiredInvitations: number;
    cancelledInvitations: number;
    acceptanceRate: number;
    averageTimeToAccept: number;
    invitationsByRole: Record<string, number>;
    invitationsByMonth: Array<{ month: string; count: number }>;
  }> {
    try {
      const response = await ApiService.get(`/organizations/${organizationId}/invitation-analytics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching invitation analytics:', error);
      throw error;
    }
  }

  // Bulk Operations
  async bulkInviteUsers(data: {
    emails: string[];
    role: 'admin' | 'manager' | 'sales' | 'agent' | 'viewer';
    workspaceId?: string;
    message?: string;
    permissions: {
      canManageUsers: boolean;
      canManageSettings: boolean;
      canViewReports: boolean;
      canManageLeads: boolean;
      canManageCampaigns: boolean;
    };
  }): Promise<{
    successful: UserInvitation[];
    failed: Array<{ email: string; error: string }>;
  }> {
    try {
      const response = await ApiService.post('/invitations/bulk', data);
      return response.data;
    } catch (error) {
      console.error('Error sending bulk invitations:', error);
      throw error;
    }
  }

  async exportInvitations(organizationId: string, format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    try {
      const response = await ApiService.get(`/organizations/${organizationId}/invitations/export?format=${format}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting invitations:', error);
      throw error;
    }
  }

  // Email Templates
  async getEmailTemplates(organizationId: string): Promise<Array<{
    id: string;
    name: string;
    subject: string;
    body: string;
    isActive: boolean;
    createdAt: string;
  }>> {
    try {
      const response = await ApiService.get(`/organizations/${organizationId}/invitation-email-templates`);
      return response.data;
    } catch (error) {
      console.error('Error fetching email templates:', error);
      throw error;
    }
  }

  async updateEmailTemplate(organizationId: string, templateId: string, data: {
    subject?: string;
    body?: string;
    isActive?: boolean;
  }): Promise<void> {
    try {
      await ApiService.put(`/organizations/${organizationId}/invitation-email-templates/${templateId}`, data);
    } catch (error) {
      console.error('Error updating email template:', error);
      throw error;
    }
  }

  // Helper Methods
  generateInviteLink(token: string): string {
    const baseUrl = process.env.EXPO_PUBLIC_APP_URL || 'https://yourcrm.app';
    return `${baseUrl}/invite/accept?token=${token}`;
  }

  async copyInviteLinkToClipboard(link: string): Promise<void> {
    try {
      // In a real React Native app, you'd use Clipboard.setString(link)
      console.log('Link copied to clipboard:', link);
    } catch (error) {
      console.error('Error copying link to clipboard:', error);
      throw error;
    }
  }

  // Role-based permission helpers
  getRolePermissions(role: string): {
    canManageUsers: boolean;
    canManageSettings: boolean;
    canViewReports: boolean;
    canManageLeads: boolean;
    canManageCampaigns: boolean;
  } {
    switch (role) {
      case 'admin':
        return {
          canManageUsers: true,
          canManageSettings: true,
          canViewReports: true,
          canManageLeads: true,
          canManageCampaigns: true
        };
      case 'manager':
        return {
          canManageUsers: true,
          canManageSettings: false,
          canViewReports: true,
          canManageLeads: true,
          canManageCampaigns: true
        };
      case 'sales':
        return {
          canManageUsers: false,
          canManageSettings: false,
          canViewReports: true,
          canManageLeads: true,
          canManageCampaigns: false
        };
      case 'agent':
        return {
          canManageUsers: false,
          canManageSettings: false,
          canViewReports: false,
          canManageLeads: true,
          canManageCampaigns: false
        };
      case 'viewer':
        return {
          canManageUsers: false,
          canManageSettings: false,
          canViewReports: true,
          canManageLeads: false,
          canManageCampaigns: false
        };
      default:
        return {
          canManageUsers: false,
          canManageSettings: false,
          canViewReports: false,
          canManageLeads: false,
          canManageCampaigns: false
        };
    }
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isInvitationExpired(invitation: UserInvitation): boolean {
    return new Date(invitation.expiresAt) < new Date();
  }

  canResendInvitation(invitation: UserInvitation): boolean {
    return invitation.status === 'pending' || invitation.status === 'expired';
  }

  canCancelInvitation(invitation: UserInvitation): boolean {
    return invitation.status === 'pending';
  }
}

export default UserInvitationService.getInstance();
