import { ApiService } from './ApiService';
import { Linking, Platform } from 'react-native';
import { io, Socket } from 'socket.io-client';
import Constants from 'expo-constants';

export interface WhatsAppMessage {
  id: string;
  messageId: string;
  contactId: string;
  contactName: string;
  contactPhone: string;
  profilePic?: string;
  message: string;
  type: 'text' | 'image' | 'video' | 'document' | 'audio' | 'button' | 'list';
  direction: 'inbound' | 'outbound';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  isBusiness: boolean;
  labels: string[];
  assignedTo?: string;
  assignedToName?: string;
  leadId?: string;
  campaignId?: string;
  metadata?: {
    fileName?: string;
    fileSize?: number;
    duration?: number;
    buttons?: Array<{ id: string; text: string; url?: string }>;
    listOptions?: Array<{ id: string; title: string; description: string }>;
  };
}

export interface WhatsAppContact {
  id: string;
  phone: string;
  name?: string;
  profilePic?: string;
  isBusiness: boolean;
  isBlocked: boolean;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  labels: string[];
  assignedTo?: string;
  assignedToName?: string;
  leadId?: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  notes?: string;
}

export interface WhatsAppCampaign {
  id: string;
  name: string;
  type: 'bulk' | 'drip' | 'automation';
  status: 'draft' | 'active' | 'paused' | 'completed';
  template: {
    name: string;
    language: string;
    category: 'marketing' | 'utility' | 'authentication';
    components: Array<{
      type: 'header' | 'body' | 'footer' | 'buttons';
      text?: string;
      format?: 'text' | 'image' | 'video' | 'document';
      buttons?: Array<{ type: 'url' | 'quick_reply'; text: string; url?: string }>;
    }>;
  };
  recipients: Array<{
    phone: string;
    name?: string;
    status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
    sentAt?: string;
  }>;
  scheduledAt?: string;
  stats: {
    totalSent: number;
    delivered: number;
    read: number;
    failed: number;
    clicked: number;
  };
  createdAt: string;
  createdBy: string;
}

export interface CallList {
  id: string;
  name: string;
  leads: Array<{
    id: string;
    name: string;
    phone: string;
    status: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    lastCallDate?: string;
    callAttempts: number;
    notes?: string;
  }>;
  filters: {
    status?: string[];
    priority?: string[];
    source?: string[];
    dateRange?: {
      start: string;
      end: string;
    };
  };
  assignedTo?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CallScript {
  id: string;
  name: string;
  leadStatus: string;
  script: string;
  keyPoints: string[];
  objections: Array<{
    objection: string;
    response: string;
  }>;
  isActive: boolean;
}

export interface CallActivity {
  id: string;
  leadId: string;
  leadName: string;
  phone: string;
  duration?: number;
  status: 'completed' | 'missed' | 'busy' | 'failed';
  recordingUrl?: string;
  transcript?: string;
  notes: string;
  outcome: 'interested' | 'not_interested' | 'follow_up' | 'callback' | 'sale' | 'wrong_number';
  nextFollowUp?: string;
  userId: string;
  timestamp: string;
}

export class CommunicationService {
  private static instance: CommunicationService;
  private socket: Socket | null = null;
  private currentUserId: string | null = null;

  static getInstance(): CommunicationService {
    if (!CommunicationService.instance) {
      CommunicationService.instance = new CommunicationService();
    }
    return CommunicationService.instance;
  }

  // WhatsApp Integration
  async getWhatsAppMessages(organizationId: string): Promise<WhatsAppMessage[]> {
    try {
      const response = await ApiService.get(`/organizations/${organizationId}/whatsapp/messages`);
      return response.data;
    } catch (error) {
      console.error('Error fetching WhatsApp messages:', error);
      throw error;
    }
  }

  async sendWhatsAppMessage(data: {
    to: string;
    message: string;
    type: 'text' | 'template';
    templateName?: string;
    templateData?: Record<string, string>;
    leadId?: string;
  }): Promise<WhatsAppMessage> {
    try {
      const response = await ApiService.post('/whatsapp/messages/send', data);
      return response.data;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      throw error;
    }
  }

  async getWhatsAppContacts(organizationId: string): Promise<WhatsAppContact[]> {
    try {
      const response = await ApiService.get(`/organizations/${organizationId}/whatsapp/contacts`);
      return response.data;
    } catch (error) {
      console.error('Error fetching WhatsApp contacts:', error);
      throw error;
    }
  }

  async syncWhatsAppContacts(organizationId: string): Promise<void> {
    try {
      await ApiService.post(`/organizations/${organizationId}/whatsapp/sync-contacts`);
    } catch (error) {
      console.error('Error syncing WhatsApp contacts:', error);
      throw error;
    }
  }

  async createWhatsAppCampaign(data: {
    name: string;
    type: 'bulk' | 'drip' | 'automation';
    templateName: string;
    recipients: Array<{ phone: string; name?: string }>;
    scheduledAt?: string;
  }): Promise<WhatsAppCampaign> {
    try {
      const response = await ApiService.post('/whatsapp/campaigns', data);
      return response.data;
    } catch (error) {
      console.error('Error creating WhatsApp campaign:', error);
      throw error;
    }
  }

  async getWhatsAppCampaigns(organizationId: string): Promise<WhatsAppCampaign[]> {
    try {
      const response = await ApiService.get(`/organizations/${organizationId}/whatsapp/campaigns`);
      return response.data;
    } catch (error) {
      console.error('Error fetching WhatsApp campaigns:', error);
      throw error;
    }
  }

  async updateWhatsAppCampaign(campaignId: string, data: Partial<WhatsAppCampaign>): Promise<WhatsAppCampaign> {
    try {
      const response = await ApiService.put(`/whatsapp/campaigns/${campaignId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating WhatsApp campaign:', error);
      throw error;
    }
  }

  async deleteWhatsAppCampaign(campaignId: string): Promise<void> {
    try {
      await ApiService.delete(`/whatsapp/campaigns/${campaignId}`);
    } catch (error) {
      console.error('Error deleting WhatsApp campaign:', error);
      throw error;
    }
  }

  // WhatsApp Templates
  async getWhatsAppTemplates(organizationId: string): Promise<Array<{
    id: string;
    name: string;
    category: 'marketing' | 'utility' | 'authentication';
    language: string;
    status: 'approved' | 'pending' | 'rejected';
    components: Array<{
      type: 'header' | 'body' | 'footer' | 'buttons';
      text?: string;
      format?: 'text' | 'image' | 'video' | 'document';
      buttons?: Array<{ type: 'url' | 'quick_reply'; text: string; url?: string }>;
    }>;
  }>> {
    try {
      const response = await ApiService.get(`/organizations/${organizationId}/whatsapp/templates`);
      return response.data;
    } catch (error) {
      console.error('Error fetching WhatsApp templates:', error);
      throw error;
    }
  }

  async createWhatsAppTemplate(data: {
    name: string;
    category: 'marketing' | 'utility' | 'authentication';
    language: string;
    components: Array<{
      type: 'header' | 'body' | 'footer' | 'buttons';
      text?: string;
      format?: 'text' | 'image' | 'video' | 'document';
      buttons?: Array<{ type: 'url' | 'quick_reply'; text: string; url?: string }>;
    }>;
  }): Promise<void> {
    try {
      await ApiService.post('/whatsapp/templates', data);
    } catch (error) {
      console.error('Error creating WhatsApp template:', error);
      throw error;
    }
  }

  // WhatsApp Automation
  async getWhatsAppAutomations(organizationId: string): Promise<Array<{
    id: string;
    name: string;
    trigger: {
      type: 'keyword' | 'time' | 'incoming_message' | 'lead_status';
      conditions: Record<string, any>;
    };
    actions: Array<{
      type: 'send_message' | 'assign_lead' | 'update_status' | 'add_label';
      parameters: Record<string, any>;
    }>;
    isActive: boolean;
    stats: {
      triggered: number;
      completed: number;
      failed: number;
    };
    createdAt: string;
  }>> {
    try {
      const response = await ApiService.get(`/organizations/${organizationId}/whatsapp/automations`);
      return response.data;
    } catch (error) {
      console.error('Error fetching WhatsApp automations:', error);
      throw error;
    }
  }

  async createWhatsAppAutomation(data: {
    name: string;
    trigger: {
      type: 'keyword' | 'time' | 'incoming_message' | 'lead_status';
      conditions: Record<string, any>;
    };
    actions: Array<{
      type: 'send_message' | 'assign_lead' | 'update_status' | 'add_label';
      parameters: Record<string, any>;
    }>;
  }): Promise<void> {
    try {
      await ApiService.post('/whatsapp/automations', data);
    } catch (error) {
      console.error('Error creating WhatsApp automation:', error);
      throw error;
    }
  }

  // Dialer Integration
  async getCallLists(organizationId: string): Promise<CallList[]> {
    try {
      const response = await ApiService.get(`/organizations/${organizationId}/dialer/lists`);
      return response.data;
    } catch (error) {
      console.error('Error fetching call lists:', error);
      throw error;
    }
  }

  async createCallList(data: {
    name: string;
    filters: {
      status?: string[];
      priority?: string[];
      source?: string[];
      dateRange?: {
        start: string;
        end: string;
      };
    };
    assignedTo?: string;
  }): Promise<CallList> {
    try {
      const response = await ApiService.post('/dialer/lists', data);
      return response.data;
    } catch (error) {
      console.error('Error creating call list:', error);
      throw error;
    }
  }

  async updateCallList(listId: string, data: Partial<CallList>): Promise<CallList> {
    try {
      const response = await ApiService.put(`/dialer/lists/${listId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating call list:', error);
      throw error;
    }
  }

  async deleteCallList(listId: string): Promise<void> {
    try {
      await ApiService.delete(`/dialer/lists/${listId}`);
    } catch (error) {
      console.error('Error deleting call list:', error);
      throw error;
    }
  }

  async getCallScripts(organizationId: string): Promise<CallScript[]> {
    try {
      const response = await ApiService.get(`/organizations/${organizationId}/dialer/scripts`);
      return response.data;
    } catch (error) {
      console.error('Error fetching call scripts:', error);
      throw error;
    }
  }

  async createCallScript(data: {
    name: string;
    leadStatus: string;
    script: string;
    keyPoints: string[];
    objections: Array<{
      objection: string;
      response: string;
    }>;
  }): Promise<CallScript> {
    try {
      const response = await ApiService.post('/dialer/scripts', data);
      return response.data;
    } catch (error) {
      console.error('Error creating call script:', error);
      throw error;
    }
  }

  async updateCallScript(scriptId: string, data: Partial<CallScript>): Promise<CallScript> {
    try {
      const response = await ApiService.put(`/dialer/scripts/${scriptId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating call script:', error);
      throw error;
    }
  }

  async deleteCallScript(scriptId: string): Promise<void> {
    try {
      await ApiService.delete(`/dialer/scripts/${scriptId}`);
    } catch (error) {
      console.error('Error deleting call script:', error);
      throw error;
    }
  }

  async logCallActivity(data: {
    leadId: string;
    phone: string;
    duration?: number;
    status: 'completed' | 'missed' | 'busy' | 'failed';
    notes: string;
    outcome: 'interested' | 'not_interested' | 'follow_up' | 'callback' | 'sale' | 'wrong_number';
    nextFollowUp?: string;
    recordingUrl?: string;
  }): Promise<CallActivity> {
    try {
      const response = await ApiService.post('/dialer/call-activity', data);
      return response.data;
    } catch (error) {
      console.error('Error logging call activity:', error);
      throw error;
    }
  }

  async getCallHistory(organizationId: string, filters?: {
    userId?: string;
    startDate?: string;
    endDate?: string;
    outcome?: string;
  }): Promise<CallActivity[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.userId) params.append('userId', filters.userId);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.outcome) params.append('outcome', filters.outcome);

      const response = await ApiService.get(`/organizations/${organizationId}/dialer/call-history?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching call history:', error);
      throw error;
    }
  }

  // Dialer Native Integration
  async triggerNativeDialer(phoneNumber: string): Promise<void> {
    try {
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      const url = `tel:${formattedPhone}`;
      const supported = await Linking.canOpenURL(url);
      
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.error('Phone dialer not supported on this device');
      }
    } catch (error) {
      console.error('Error opening native dialer:', error);
      throw error;
    }
  }

  setupDialerSocket(userId: string, token: string): void {
    if (this.socket && this.currentUserId === userId) return;
    
    this.currentUserId = userId;
    const apiUrl = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000';
    
    this.socket = io(`${apiUrl}/dialer`, {
      query: { userId, token },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('Connected to Dialer WebSocket');
    });

    this.socket.on('new_lead_to_call', async (data: { leadId: string, leadName: string, leadPhone: string }) => {
      console.log('Received lead to call:', data);
      // Automatically trigger the dialer
      await this.triggerNativeDialer(data.leadPhone);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from Dialer WebSocket');
    });
  }

  async reportCallResult(data: {
    leadId: string,
    agentId: string,
    status: string,
    duration: number,
    notes: string,
    workspaceId: string,
    organization_id: string
  }): Promise<void> {
    if (this.socket && this.socket.connected) {
      this.socket.emit('call_result', data);
    } else {
      // Fallback to HTTP if socket is down
      await this.logCallActivity({
        leadId: data.leadId,
        phone: '', // Will be resolved backend
        duration: data.duration,
        status: data.status as any,
        notes: data.notes,
        outcome: 'interested', // Default or from data
      });
    }
  }

  async startAutoDialer(listId: string, userId: string): Promise<void> {
    try {
      await ApiService.post('/dialer/auto-dialer/start', { listId, userId });
    } catch (error) {
      console.error('Error starting auto dialer:', error);
      throw error;
    }
  }

  async stopAutoDialer(sessionId: string): Promise<void> {
    try {
      await ApiService.post('/dialer/auto-dialer/stop', { sessionId });
    } catch (error) {
      console.error('Error stopping auto dialer:', error);
      throw error;
    }
  }

  async getAutoDialerStatus(userId: string): Promise<{
    isActive: boolean;
    currentLeadIndex: number;
    totalLeads: number;
    sessionStartTime: string;
  }> {
    try {
      const response = await ApiService.get(`/dialer/auto-dialer/status/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching auto dialer status:', error);
      throw error;
    }
  }

  // Communication Analytics
  async getCommunicationAnalytics(organizationId: string): Promise<{
    whatsapp: {
      totalMessages: number;
      sentMessages: number;
      receivedMessages: number;
      responseRate: number;
      averageResponseTime: number;
      topContacts: Array<{
        contactName: string;
        messageCount: number;
      }>;
    };
    calls: {
      totalCalls: number;
      completedCalls: number;
      missedCalls: number;
      averageCallDuration: number;
      callsByOutcome: Record<string, number>;
      topPerformers: Array<{
        userName: string;
        callCount: number;
        successRate: number;
      }>;
    };
    campaigns: {
      totalCampaigns: number;
      activeCampaigns: number;
      totalSent: number;
      totalDelivered: number;
      totalRead: number;
      averageEngagementRate: number;
    };
  }> {
    try {
      const response = await ApiService.get(`/organizations/${organizationId}/communication/analytics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching communication analytics:', error);
      throw error;
    }
  }

  // Integration Settings
  async getWhatsAppSettings(organizationId: string): Promise<{
    isConnected: boolean;
    phoneNumber: string;
    businessProfile: {
      name: string;
      description: string;
      address?: string;
      email?: string;
      website?: string;
    };
    webhookUrl: string;
    autoReplyEnabled: boolean;
    businessHours: {
      enabled: boolean;
      timezone: string;
      hours: Array<{
        day: string;
        open: string;
        close: string;
      }>;
    };
  }> {
    try {
      const response = await ApiService.get(`/organizations/${organizationId}/whatsapp/settings`);
      return response.data;
    } catch (error) {
      console.error('Error fetching WhatsApp settings:', error);
      throw error;
    }
  }

  async updateWhatsAppSettings(organizationId: string, data: {
    autoReplyEnabled?: boolean;
    businessHours?: {
      enabled: boolean;
      timezone: string;
      hours: Array<{
        day: string;
        open: string;
        close: string;
      }>;
    };
  }): Promise<void> {
    try {
      await ApiService.put(`/organizations/${organizationId}/whatsapp/settings`, data);
    } catch (error) {
      console.error('Error updating WhatsApp settings:', error);
      throw error;
    }
  }

  async getDialerSettings(organizationId: string): Promise<{
    defaultCallerId?: string;
    recordingEnabled: boolean;
    autoDialerEnabled: boolean;
    callDistribution: 'round_robin' | 'random' | 'priority_based';
    businessHours: {
      enabled: boolean;
      timezone: string;
      hours: Array<{
        day: string;
        open: string;
        close: string;
      }>;
    };
  }> {
    try {
      const response = await ApiService.get(`/organizations/${organizationId}/dialer/settings`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dialer settings:', error);
      throw error;
    }
  }

  async updateDialerSettings(organizationId: string, data: {
    defaultCallerId?: string;
    recordingEnabled?: boolean;
    autoDialerEnabled?: boolean;
    callDistribution?: 'round_robin' | 'random' | 'priority_based';
    businessHours?: {
      enabled: boolean;
      timezone: string;
      hours: Array<{
        day: string;
        open: string;
        close: string;
      }>;
    };
  }): Promise<void> {
    try {
      await ApiService.put(`/organizations/${organizationId}/dialer/settings`, data);
    } catch (error) {
      console.error('Error updating dialer settings:', error);
      throw error;
    }
  }

  // Helper Methods
  formatPhoneNumber(phone: string): string {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Add country code if missing (assuming India for demo)
    if (cleaned.length === 10) {
      return `+91${cleaned}`;
    }
    
    if (cleaned.startsWith('91') && cleaned.length === 12) {
      return `+${cleaned}`;
    }
    
    if (cleaned.startsWith('0') && cleaned.length === 11) {
      return `+91${cleaned.substring(1)}`;
    }
    
    return phone;
  }

  validatePhoneNumber(phone: string): boolean {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  }

  getWhatsAppMessageTemplate(templateName: string, variables: Record<string, string>): string {
    const templates: Record<string, string> = {
      'welcome': 'Hello {{name}}, welcome to our service! How can we help you today?',
      'appointment_reminder': 'Hi {{name}}, this is a reminder about your appointment on {{date}} at {{time}}.',
      'follow_up': 'Hello {{name}}, following up on our previous conversation. Do you have any questions?',
      'promotion': 'Special offer for {{name}}! Get {{discount}}% off on {{product}}. Limited time only!',
      'feedback': 'Hi {{name}}, how was your experience with our {{service}}? We\'d love to hear your feedback.'
    };

    let template = templates[templateName] || templateName;
    
    // Replace variables
    Object.entries(variables).forEach(([key, value]) => {
      template = template.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });

    return template;
  }

  calculateCallMetrics(calls: CallActivity[]): {
    totalCalls: number;
    completedCalls: number;
    missedCalls: number;
    averageCallDuration: number;
    successRate: number;
  } {
    const totalCalls = calls.length;
    const completedCalls = calls.filter(call => call.status === 'completed').length;
    const missedCalls = calls.filter(call => call.status === 'missed' || call.status === 'busy' || call.status === 'failed').length;
    
    const totalDuration = calls.reduce((sum, call) => sum + (call.duration || 0), 0);
    const averageCallDuration = completedCalls > 0 ? totalDuration / completedCalls : 0;
    
    const successfulCalls = calls.filter(call => 
      call.outcome === 'interested' || call.outcome === 'follow_up' || call.outcome === 'sale'
    ).length;
    const successRate = completedCalls > 0 ? (successfulCalls / completedCalls) * 100 : 0;

    return {
      totalCalls,
      completedCalls,
      missedCalls,
      averageCallDuration,
      successRate
    };
  }
}

export default CommunicationService.getInstance();
