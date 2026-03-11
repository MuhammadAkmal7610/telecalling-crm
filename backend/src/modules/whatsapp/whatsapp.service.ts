import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { NotificationsService } from '../notifications/notifications.service';

export interface WhatsAppMessage {
  id: string;
  from: string;
  to: string;
  message: string;
  type: 'text' | 'image' | 'document' | 'template';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  workspace_id: string;
  organization_id: string;
  lead_id?: string;
  template_name?: string;
  media_url?: string;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  language: string;
  components: any[];
  status: 'approved' | 'pending' | 'rejected';
  workspace_id: string;
  organization_id: string;
}

export interface WhatsAppWebhook {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      field: string;
      value: {
        messaging_product: string;
        metadata: any;
        contacts?: Array<{
          profile: { name: string };
          wa_id: string;
        }>;
        messages?: Array<{
          from: string;
          id: string;
          timestamp: string;
          text?: { body: string };
          type: string;
        }>;
        statuses?: Array<{
          id: string;
          status: string;
          timestamp: string;
          recipient_id: string;
        }>;
      };
    }>;
  }>;
}

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);
  private readonly MESSAGES_TABLE = 'whatsapp_messages';
  private readonly TEMPLATES_TABLE = 'whatsapp_templates';
  private readonly CONVERSATIONS_TABLE = 'whatsapp_conversations';

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async sendMessage(messageData: Partial<WhatsAppMessage>, user: any) {
    const supabase = this.supabaseService.getAdminClient();
    
    try {
      // Get WhatsApp configuration
      const config = await this.getWhatsAppConfig(user.organization_id);
      
      if (!config) {
        throw new BadRequestException('WhatsApp not configured for this organization');
      }

      // Create message record
      const { data: message, error } = await supabase
        .from(this.MESSAGES_TABLE)
        .insert({
          ...messageData,
          status: 'sent',
          created_at: new Date().toISOString(),
          workspace_id: user.workspace_id,
          organization_id: user.organization_id,
        })
        .select()
        .single();

      if (error) throw error;

      // Send via WhatsApp API
      const apiResponse = await this.sendWhatsAppAPI(message, config);
      
      // Update message with API response
      await supabase
        .from(this.MESSAGES_TABLE)
        .update({
          external_id: apiResponse.message_id,
          status: 'sent'
        })
        .eq('id', message.id);

      // Update conversation
      if (messageData.to) {
        await this.updateConversation(messageData.to, user);
      }

      this.logger.log(`WhatsApp message sent to ${messageData.to}`);
      return message;

    } catch (error) {
      this.logger.error('Error sending WhatsApp message:', error);
      throw new BadRequestException('Failed to send WhatsApp message');
    }
  }

  async sendTemplateMessage(
    to: string,
    templateName: string,
    variables: Record<string, any>,
    user: any
  ) {
    const supabase = this.supabaseService.getAdminClient();
    
    try {
      // Get template
      const { data: template, error } = await supabase
        .from(this.TEMPLATES_TABLE)
        .select('*')
        .eq('name', templateName)
        .eq('workspace_id', user.workspace_id)
        .single();

      if (error || !template) {
        throw new BadRequestException('Template not found');
      }

      // Send template message
      const message = await this.sendMessage({
        to,
        type: 'template',
        template_name: templateName,
        message: this.formatTemplateMessage(template, variables),
      }, user);

      return message;

    } catch (error) {
      this.logger.error('Error sending template message:', error);
      throw error;
    }
  }

  async handleWebhook(webhookData: WhatsAppWebhook) {
    const supabase = this.supabaseService.getAdminClient();
    
    try {
      for (const entry of webhookData.entry) {
        for (const change of entry.changes) {
          if (change.field === 'messages') {
            await this.handleIncomingMessage(change.value);
          } else if (change.field === 'message_status') {
            await this.handleMessageStatus(change.value);
          }
        }
      }

      return { status: 'success' };

    } catch (error) {
      this.logger.error('Error handling webhook:', error);
      throw error;
    }
  }

  async getMessages(leadId: string, user: any) {
    const supabase = this.supabaseService.getAdminClient();
    
    const { data, error } = await supabase
      .from(this.MESSAGES_TABLE)
      .select('*')
      .eq('lead_id', leadId)
      .eq('workspace_id', user.workspace_id)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }

  async getConversations(user: any, status?: string) {
    const supabase = this.supabaseService.getAdminClient();
    
    let query = supabase
      .from(this.CONVERSATIONS_TABLE)
      .select(`
        *,
        lead:leads(id, name, phone, status),
        last_message:whatsapp_messages(id, message, created_at, status)
      `)
      .eq('workspace_id', user.workspace_id);

    if (status) {
      query = query.eq('status', status);
    }

    const result = await query.order('last_message_at', { ascending: false });
    const { data, error } = result;

    if (error) throw error;
    return data;
  }

  async getAnalytics(workspaceId: string, timeRange: string = 'week') {
    const supabase = this.supabaseService.getAdminClient();
    
    const now = new Date();
    let daysBack = 7;
    
    switch (timeRange) {
      case 'day': daysBack = 1; break;
      case 'week': daysBack = 7; break;
      case 'month': daysBack = 30; break;
    }

    const dateFrom = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
    
    // Get message analytics
    const { data: messages, error } = await supabase
      .from(this.MESSAGES_TABLE)
      .select('status, type, created_at')
      .eq('workspace_id', workspaceId)
      .gte('created_at', dateFrom.toISOString());

    if (error) throw error;

    // Calculate metrics
    const totalMessages = messages?.length || 0;
    const sentMessages = messages?.filter(m => m.status === 'sent').length || 0;
    const deliveredMessages = messages?.filter(m => m.status === 'delivered').length || 0;
    const readMessages = messages?.filter(m => m.status === 'read').length || 0;
    const failedMessages = messages?.filter(m => m.status === 'failed').length || 0;

    const deliveryRate = sentMessages > 0 ? (deliveredMessages / sentMessages) * 100 : 0;
    const readRate = deliveredMessages > 0 ? (readMessages / deliveredMessages) * 100 : 0;

    // Group by day
    const messageVolume = this.groupMessagesByDay(messages || [], daysBack);

    return {
      totalMessages,
      sentMessages,
      deliveredMessages,
      readMessages,
      failedMessages,
      deliveryRate: Math.round(deliveryRate),
      readRate: Math.round(readRate),
      messageVolume,
      timeRange,
    };
  }

  private async sendWhatsAppAPI(message: any, config: any) {
    // Implementation depends on WhatsApp provider (Twilio, Direct API, etc.)
    // This is a placeholder for the actual API call
    
    if (config.provider === 'twilio') {
      return this.sendViaTwilio(message, config);
    } else if (config.provider === 'direct') {
      return this.sendViaDirectAPI(message, config);
    }
    
    throw new BadRequestException('Invalid WhatsApp provider');
  }

  private async sendViaTwilio(message: any, config: any) {
    // Twilio WhatsApp API implementation
    const twilio = require('twilio');
    const client = twilio(config.accountSid, config.authToken);
    
    const response = await client.messages.create({
      body: message.message,
      from: `whatsapp:${config.phoneNumber}`,
      to: `whatsapp:${message.to}`,
    });

    return {
      message_id: response.sid,
      status: response.status,
    };
  }

  private async sendViaDirectAPI(message: any, config: any) {
    // Direct WhatsApp Business API implementation
    const response = await fetch(`https://graph.facebook.com/v18.0/${config.phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: message.to,
        type: message.type,
        [message.type]: message.type === 'text' 
          ? { body: message.message }
          : { template_name: message.template_name },
      }),
    });

    const data = await response.json();
    return {
      message_id: data.messages[0].id,
      status: 'sent',
    };
  }

  private async handleIncomingMessage(value: any) {
    const supabase = this.supabaseService.getAdminClient();
    
    if (!value.messages || value.messages.length === 0) return;

    const message = value.messages[0];
    const contact = value.contacts?.[0];

    // Find or create lead
    const { data: lead } = await supabase
      .from('leads')
      .select('*')
      .eq('phone', message.from)
      .single();

    if (!lead) {
      // Create new lead from WhatsApp message
      await this.createLeadFromWhatsApp(message, contact);
    }

    // Save incoming message
    await supabase
      .from(this.MESSAGES_TABLE)
      .insert({
        external_id: message.id,
        from: message.from,
        to: value.metadata.phone_number_id,
        message: message.text?.body || '',
        type: message.type,
        status: 'received',
        timestamp: new Date(parseInt(message.timestamp) * 1000).toISOString(),
        lead_id: lead?.id,
        workspace_id: lead?.workspace_id,
        organization_id: lead?.organization_id,
      });

    // Update conversation
    await this.updateConversation(message.from, { id: lead?.user_id });
  }

  private async handleMessageStatus(value: any) {
    const supabase = this.supabaseService.getAdminClient();
    
    if (!value.statuses || value.statuses.length === 0) return;

    const status = value.statuses[0];

    // Update message status
    await supabase
      .from(this.MESSAGES_TABLE)
      .update({
        status: status.status,
        updated_at: new Date(parseInt(status.timestamp) * 1000).toISOString(),
      })
      .eq('external_id', status.id);
  }

  private async updateConversation(phoneNumber: string, user: any) {
    const supabase = this.supabaseService.getAdminClient();
    
    // Find or create conversation
    const { data: conversation } = await supabase
      .from(this.CONVERSATIONS_TABLE)
      .select('*')
      .eq('phone_number', phoneNumber)
      .eq('workspace_id', user.workspace_id)
      .single();

    if (conversation) {
      await supabase
        .from(this.CONVERSATIONS_TABLE)
        .update({
          last_message_at: new Date().toISOString(),
          status: 'active',
        })
        .eq('id', conversation.id);
    } else {
      await supabase
        .from(this.CONVERSATIONS_TABLE)
        .insert({
          phone_number: phoneNumber,
          workspace_id: user.workspace_id,
          organization_id: user.organization_id,
          status: 'active',
          last_message_at: new Date().toISOString(),
        });
    }
  }

  private async createLeadFromWhatsApp(message: any, contact: any) {
    const supabase = this.supabaseService.getAdminClient();
    
    // Get default workspace for the organization
    const { data: workspace } = await supabase
      .from('workspaces')
      .select('*')
      .eq('organization_id', contact.organization_id)
      .eq('is_default', true)
      .single();

    await supabase
      .from('leads')
      .insert({
        name: contact?.profile?.name || 'WhatsApp Lead',
        phone: message.from,
        source: 'WHATSAPP',
        status: 'fresh',
        workspace_id: workspace?.id,
        organization_id: contact.organization_id,
        created_at: new Date().toISOString(),
      });
  }

  private async getWhatsAppConfig(organizationId: string) {
    const supabase = this.supabaseService.getAdminClient();
    
    const { data, error } = await supabase
      .from('integrations')
      .select('config')
      .eq('organization_id', organizationId)
      .eq('type', 'whatsapp')
      .eq('status', 'active')
      .single();

    if (error || !data) return null;
    return data.config;
  }

  private formatTemplateMessage(template: any, variables: Record<string, any>) {
    // Format template message with variables
    let message = template.components?.[0]?.text || '';
    
    Object.entries(variables).forEach(([key, value]) => {
      message = message.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    });
    
    return message;
  }

  private groupMessagesByDay(messages: any[], daysBack: number) {
    const volume = [];
    
    for (let i = 0; i < daysBack; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (daysBack - 1 - i));
      const dateStr = date.toISOString().split('T')[0];
      
      const dayMessages = messages.filter(m => 
        m.created_at?.startsWith(dateStr)
      );
      
      volume.push({
        date: dateStr,
        sent: dayMessages.filter(m => m.type !== 'received').length,
        received: dayMessages.filter(m => m.type === 'received').length,
        total: dayMessages.length,
      });
    }
    
    return volume;
  }
}
