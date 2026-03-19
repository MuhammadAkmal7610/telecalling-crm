import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
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
    private readonly notificationsGateway: NotificationsGateway,
    private readonly configService: ConfigService,
  ) {}

  async sendMessage(messageData: Partial<WhatsAppMessage>, user: any) {
    const supabase = this.supabaseService.getAdminClient();
    
    try {
      // Get WhatsApp configuration
      const config = await this.getWhatsAppConfig(user.organizationId);
      
      if (!config) {
        throw new BadRequestException('WhatsApp not configured for this organization');
      }

      // Create message record
      const { data: message, error } = await supabase
        .from(this.MESSAGES_TABLE)
        .insert({
          ...messageData,
          from: config.phoneNumber || config.phoneNumberId || 'System',
          status: 'sent',
          created_at: new Date().toISOString(),
          workspace_id: user.workspaceId,
          organization_id: user.organizationId,
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
        await this.updateConversation(messageData.to, user, messageData.message, false);
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
    
    if (!leadId || !user.workspaceId) {
      throw new BadRequestException('Lead ID and Workspace ID are required');
    }

    const { data, error } = await supabase
      .from(this.MESSAGES_TABLE)
      .select('*')
      .eq('lead_id', leadId)
      .eq('workspace_id', user.workspaceId)
      .order('created_at', { ascending: true });

    if (error) {
      this.logger.error('Error fetching WhatsApp messages:', error);
      throw error;
    }
    return data;
  }

  async getConversations(user: any, status?: string) {
    const supabase = this.supabaseService.getAdminClient();
    
    if (!user.workspaceId) {
      throw new BadRequestException('Workspace ID is required');
    }

    let query = supabase
      .from(this.CONVERSATIONS_TABLE)
      .select(`
        *,
        lead:leads(id, name, phone, status)
      `)
      .eq('workspace_id', user.workspaceId);

    if (status) {
      query = query.eq('status', status);
    }

    const result = await query.order('last_message_at', { ascending: false });
    const { data, error } = result;

    if (error) {
      this.logger.error(`Error fetching WhatsApp conversations for workspace ${user.workspace_id}: ${error.message}`, error.stack);
      throw error;
    }
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
    const accessToken = config.accessToken || this.configService.get('WHATSAPP_ACCESS_TOKEN');
    const phoneNumberId = config.phoneNumberId || this.configService.get('WHATSAPP_PHONE_NUMBER_ID');
    const version = config.apiVersion || this.configService.get('WHATSAPP_API_VERSION') || 'v19.0';

    if (!accessToken || !phoneNumberId) {
      throw new BadRequestException('WhatsApp Cloud API credentials missing');
    }

    const response = await fetch(`https://graph.facebook.com/${version}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: message.to,
        type: message.type || 'text',
        [message.type || 'text']: message.type === 'template' 
          ? { 
              name: message.template_name,
              language: { code: 'en_US' }, // default or from message
              components: message.components || [] 
            }
          : { body: message.message || '' },
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      this.logger.error(`WhatsApp Direct API Error: ${JSON.stringify(data.error, null, 2)}`);
      throw new BadRequestException(data.error.message);
    }

    return {
      message_id: data.messages[0].id,
      status: 'sent',
    };
  }

  async verifyWebhook(mode: string, token: string, challenge: string) {
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || '3B5KlEMHYI5RqCxe1YyP3gnavTN_2k7antr5xSVhSrwqT9Awc';
    
    this.logger.log(`Verifying Webhook - Mode: ${mode}, Token: ${token}, VerifyToken: ${verifyToken}`);

    if (mode === 'subscribe' && token === verifyToken) {
      this.logger.log('WhatsApp Webhook Verified Successfully');
      return challenge;
    }
    
    this.logger.error(`Webhook verification failed. Expected ${verifyToken} but got ${token}`);
    throw new BadRequestException('Invalid verification token');
  }

  private async handleIncomingMessage(value: any) {
    const supabase = this.supabaseService.getAdminClient();
    
    if (!value.messages || value.messages.length === 0) return;

    const message = value.messages[0];
    const contact = value.contacts?.[0];

    // Find lead
    const { data: lead } = await supabase
      .from('leads')
      .select('*')
      .eq('phone', message.from)
      .single();

    const messageData = {
      external_id: message.id,
      from: message.from,
      to: value.metadata.display_phone_number || value.metadata.phone_number_id,
      message: message.text?.body || '',
      type: message.type,
      status: 'received',
      timestamp: new Date(parseInt(message.timestamp) * 1000).toISOString(),
      lead_id: lead?.id,
      workspace_id: lead?.workspace_id,
      organization_id: lead?.organization_id,
    };

    // Save incoming message
    const { data: insertedMessage } = await supabase
      .from(this.MESSAGES_TABLE)
      .insert(messageData)
      .select()
      .single();

    // Update conversation
    if (lead) {
      await this.updateConversation(message.from, lead, messageData.message, true);
    }

    // Emit real-time update
    if (messageData.organization_id) {
       this.notificationsGateway.server
         .to(`org_${messageData.organization_id}`)
         .emit('whatsapp_message_received', insertedMessage || messageData);
    }
  }

  private async handleMessageStatus(value: any) {
    const supabase = this.supabaseService.getAdminClient();
    
    if (!value.statuses || value.statuses.length === 0) return;

    const status = value.statuses[0];

    // Update message status
    const { data: updatedMessage } = await supabase
      .from(this.MESSAGES_TABLE)
      .update({
        status: status.status,
        updated_at: new Date(parseInt(status.timestamp) * 1000).toISOString(),
      })
      .eq('external_id', status.id)
      .select()
      .single();

    // Emit real-time status update
    if (updatedMessage?.organization_id) {
      this.notificationsGateway.server
        .to(`org_${updatedMessage.organization_id}`)
        .emit('whatsapp_message_status', {
          external_id: status.id,
          status: status.status,
          lead_id: updatedMessage.lead_id
        });
    }
  }

  private async updateConversation(phoneNumber: string, user: any, messageContent?: string, isIncoming: boolean = false) {
    const supabase = this.supabaseService.getAdminClient();
    
    // Find or create conversation
    const { data: conversation } = await supabase
      .from(this.CONVERSATIONS_TABLE)
      .select('*')
      .eq('phone_number', phoneNumber)
      .eq('workspace_id', user.workspaceId)
      .single();

    if (conversation) {
      await supabase
        .from(this.CONVERSATIONS_TABLE)
        .update({
          last_message_at: new Date().toISOString(),
          last_message_content: messageContent || conversation.last_message_content,
          unread_count: isIncoming ? (conversation.unread_count || 0) + 1 : 0,
          status: 'active',
        })
        .eq('id', conversation.id);
    } else {
      await supabase
        .from(this.CONVERSATIONS_TABLE)
        .insert({
          phone_number: phoneNumber,
          workspace_id: user.workspaceId,
          organization_id: user.organizationId,
          last_message_content: messageContent,
          unread_count: isIncoming ? 1 : 0,
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
        organization_id: contact.organizationId,
        created_at: new Date().toISOString(),
      });
  }

  private async getWhatsAppConfig(organizationId: string) {
    const supabase = this.supabaseService.getAdminClient();
    
    // 1. Try to get from database
    const { data, error } = await supabase
      .from('integrations')
      .select('config')
      .eq('organization_id', organizationId)
      .eq('type', 'whatsapp')
      .eq('status', 'active')
      .single();

    if (!error && data?.config) {
      return data.config;
    }

    // 2. Fall back to Environment Variables (for dev/default setup)
    const envAccessToken = this.configService.get('WHATSAPP_ACCESS_TOKEN');
    const envPhoneID = this.configService.get('WHATSAPP_PHONE_NUMBER_ID');
    const envPhoneNum = this.configService.get('WHATSAPP_PHONE_NUMBER');
    
    if (envAccessToken && envPhoneID) {
      return {
        provider: 'direct',
        accessToken: envAccessToken,
        phoneNumberId: envPhoneID,
        phoneNumber: envPhoneNum || envPhoneID,
        businessAccountId: this.configService.get('WHATSAPP_BUSINESS_ACCOUNT_ID'),
        apiVersion: this.configService.get('WHATSAPP_API_VERSION') || 'v19.0',
      };
    }

    return null;
  }

  private formatTemplateMessage(template: any, variables: Record<string, any>) {
    // Format template message with variables
    let message = template.components?.[0]?.text || '';
    
    Object.entries(variables).forEach(([key, value]) => {
      message = message.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    });
    
    return message;
  }

  async syncTemplatesFromMeta(user: any) {
    const supabase = this.supabaseService.getAdminClient();
    const config = await this.getWhatsAppConfig(user.organizationId);
    
    if (!config || config.provider !== 'direct') {
      throw new BadRequestException('WhatsApp Cloud API not configured or not using direct provider');
    }

    const accessToken = config.accessToken || this.configService.get('WHATSAPP_ACCESS_TOKEN');
    const businessAccountId = config.businessAccountId || this.configService.get('WHATSAPP_BUSINESS_ACCOUNT_ID');
    const version = config.apiVersion || this.configService.get('WHATSAPP_API_VERSION') || 'v19.0';

    if (!accessToken || !businessAccountId) {
      throw new BadRequestException('Meta Business Account ID or Access Token missing');
    }

    try {
      const response = await fetch(`https://graph.facebook.com/${version}/${businessAccountId}/message_templates`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);

      const templates = data.data || [];
      const results = [];

      for (const t of templates) {
        const { data: upserted, error } = await supabase
          .from(this.TEMPLATES_TABLE)
          .upsert({
            name: t.name,
            category: t.category,
            language: t.language,
            components: t.components,
            status: t.status.toLowerCase(),
            workspace_id: user.workspaceId,
            organization_id: user.organizationId,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'workspace_id, name' })
          .select()
          .single();

        if (error) {
          this.logger.error(`Failed to upsert template ${t.name}: ${error.message}`);
        } else {
          results.push(upserted);
        }
      }

      return {
        message: 'Templates synced successfully',
        count: results.length,
        templates: results,
      };

    } catch (error) {
      this.logger.error('Error syncing WhatsApp templates:', error);
      throw new BadRequestException('Failed to sync templates from Meta');
    }
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
