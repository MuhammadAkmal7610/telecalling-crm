import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateWhatsAppCampaignDto, CreateWhatsAppDripSequenceDto, CreateWhatsAppTemplateDto, CreateWhatsAppAutomationRuleDto } from './dto/whatsapp-campaign.dto';

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
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
    if (!verifyToken) {
      this.logger.error('WHATSAPP_VERIFY_TOKEN is not configured');
      throw new BadRequestException('Webhook verification is not configured');
    }

    if (mode === 'subscribe' && token === verifyToken) {
      this.logger.log('WhatsApp Webhook Verified Successfully');
      return challenge;
    }
    
    this.logger.warn('WhatsApp webhook verification failed');
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

  // === CAMPAIGN MANAGEMENT METHODS ===

  async createCampaign(dto: CreateWhatsAppCampaignDto, user: any) {
    const supabase = this.supabaseService.getAdminClient();
    
    if (!user.workspaceId) {
      throw new BadRequestException('Workspace ID is required');
    }

    const campaignData = {
      ...dto,
      organization_id: user.organizationId,
      workspace_id: user.workspaceId,
      created_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('whatsapp_campaigns')
      .insert(campaignData)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    
    // If campaign is scheduled or immediate, process recipients
    if (dto.schedule_type === 'immediate') {
      await this.processCampaignRecipients(data.id, user);
    }

    return data;
  }

  async getCampaigns(query: any, user: any) {
    const supabase = this.supabaseService.getAdminClient();
    const { page = 1, limit = 20, search, status, campaign_type } = query;
    const from = (page - 1) * limit;

    if (!user.workspaceId) {
      throw new BadRequestException('Workspace ID is required');
    }

    let q = supabase
      .from('whatsapp_campaigns')
      .select('*', { count: 'exact' })
      .eq('workspace_id', user.workspaceId)
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1);

    if (search) q = q.ilike('name', `%${search}%`);
    if (status) q = q.eq('status', status);
    if (campaign_type) q = q.eq('campaign_type', campaign_type);

    const { data, error, count } = await q;
    if (error) throw new BadRequestException(error.message);

    return { data, total: count, page, limit };
  }

  async getCampaign(id: string, user: any) {
    const supabase = this.supabaseService.getAdminClient();
    
    if (!user.workspaceId) {
      throw new BadRequestException('Workspace ID is required');
    }
    
    const { data, error } = await supabase
      .from('whatsapp_campaigns')
      .select('*')
      .eq('id', id)
      .eq('workspace_id', user.workspaceId)
      .single();

    if (error || !data) throw new BadRequestException('Campaign not found');
    return data;
  }

  async updateCampaign(id: string, dto: any, user: any) {
    const supabase = this.supabaseService.getAdminClient();
    
    if (!user.workspaceId) {
      throw new BadRequestException('Workspace ID is required');
    }
    
    await this.getCampaign(id, user);

    const updateData = {
      ...dto,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('whatsapp_campaigns')
      .update(updateData)
      .eq('id', id)
      .eq('workspace_id', user.workspaceId)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async deleteCampaign(id: string, user: any) {
    const supabase = this.supabaseService.getAdminClient();
    
    if (!user.workspaceId) {
      throw new BadRequestException('Workspace ID is required');
    }
    
    await this.getCampaign(id, user);
    
    const { error } = await supabase
      .from('whatsapp_campaigns')
      .delete()
      .eq('id', id)
      .eq('workspace_id', user.workspaceId);
    
    if (error) throw new BadRequestException(error.message);
    return { message: 'Campaign deleted' };
  }

  async processCampaignRecipients(campaignId: string, user: any) {
    const supabase = this.supabaseService.getAdminClient();
    
    // Get campaign details
    const campaign = await this.getCampaign(campaignId, user);
    
    // Get leads based on campaign filters
    let leadsQuery = supabase
      .from('leads')
      .select('*')
      .eq('workspace_id', user.workspaceId)
      .eq('organization_id', user.organizationId);

    // Apply campaign filters
    if (campaign.target_audience) {
      Object.entries(campaign.target_audience).forEach(([field, value]) => {
        if (field === 'status') {
          leadsQuery = leadsQuery.eq('status', value);
        } else if (field === 'source') {
          leadsQuery = leadsQuery.eq('source', value);
        }
      });
    }

    const { data: leads, error } = await leadsQuery;
    if (error) throw new BadRequestException(error.message);

    // Create campaign recipients
    const recipients = leads.map((lead: any) => ({
      campaign_id: campaignId,
      lead_id: lead.id,
      organization_id: user.organizationId,
      workspace_id: user.workspaceId,
      phone_number: lead.phone,
      message_content: campaign.message_content,
      variables_used: this.mapLeadToVariables(lead, campaign.variables_mapping),
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    if (recipients.length > 0) {
      const { error: insertError } = await supabase
        .from('whatsapp_campaign_recipients')
        .insert(recipients);

      if (insertError) {
        this.logger.error('Error creating campaign recipients:', insertError);
      }

      // Update campaign stats
      await supabase
        .from('whatsapp_campaigns')
        .update({
          total_recipients: recipients.length,
          status: 'running',
          started_at: new Date().toISOString()
        })
        .eq('id', campaignId);
    }
  }

  async runCampaign(campaignId: string, user: any) {
    const supabase = this.supabaseService.getAdminClient();
    const campaign = await this.getCampaign(campaignId, user);

    if (campaign.status === 'completed') {
      throw new BadRequestException('Campaign is already completed');
    }

    // Get pending recipients
    const { data: recipients, error } = await supabase
      .from('whatsapp_campaign_recipients')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('status', 'pending')
      .limit(campaign.rate_limit_per_hour || 100);

    if (error) throw new BadRequestException(error.message);

    let successCount = 0;
    let failCount = 0;

    for (const recipient of recipients) {
      try {
        await this.sendMessage({
          to: recipient.phone_number,
          message: recipient.message_content,
          type: 'text',
        }, user);

        await supabase
          .from('whatsapp_campaign_recipients')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString()
          })
          .eq('id', recipient.id);

        successCount++;
      } catch (err) {
        this.logger.error(`Failed to send message to ${recipient.phone_number}: ${err.message}`);
        
        await supabase
          .from('whatsapp_campaign_recipients')
          .update({
            status: 'failed',
            error_message: err.message,
            failed_at: new Date().toISOString()
          })
          .eq('id', recipient.id);

        failCount++;
      }
    }

    // Update campaign progress
    const { data: updatedCampaign } = await supabase
      .from('whatsapp_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    const totalSent = updatedCampaign.sent_count + successCount;
    const totalFailed = updatedCampaign.failed_count + failCount;
    const progress = Math.round((totalSent / updatedCampaign.total_recipients) * 100);

    await supabase
      .from('whatsapp_campaigns')
      .update({
        sent_count: totalSent,
        failed_count: totalFailed,
        progress
      })
      .eq('id', campaignId);

    return { successCount, failCount, total: recipients.length };
  }

  // === DRIP SEQUENCE METHODS ===

  async createDripSequence(dto: CreateWhatsAppDripSequenceDto, user: any) {
    const supabase = this.supabaseService.getAdminClient();
    
    if (!user.workspaceId) {
      throw new BadRequestException('Workspace ID is required');
    }

    const sequenceData = {
      ...dto,
      organization_id: user.organizationId,
      workspace_id: user.workspaceId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('whatsapp_drip_sequences')
      .insert(sequenceData)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async enrollLeadInDripSequence(sequenceId: string, leadId: string, reason: string, user: any) {
    const supabase = this.supabaseService.getAdminClient();
    
    if (!user.workspaceId) {
      throw new BadRequestException('Workspace ID is required');
    }

    // Check if already enrolled
    const { data: existingEnrollment } = await supabase
      .from('whatsapp_drip_enrollments')
      .select('*')
      .eq('drip_sequence_id', sequenceId)
      .eq('lead_id', leadId)
      .single();

    if (existingEnrollment) {
      throw new BadRequestException('Lead is already enrolled in this sequence');
    }

    const enrollmentData = {
      drip_sequence_id: sequenceId,
      lead_id: leadId,
      organization_id: user.organizationId,
      workspace_id: user.workspaceId,
      enrollment_reason: reason,
      next_run_at: new Date(Date.now() + (60 * 60 * 1000)).toISOString(), // Start in 1 hour
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('whatsapp_drip_enrollments')
      .insert(enrollmentData)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  // === TEMPLATE MANAGEMENT METHODS ===

  async createTemplate(dto: CreateWhatsAppTemplateDto, user: any) {
    const supabase = this.supabaseService.getAdminClient();
    
    if (!user.workspaceId) {
      throw new BadRequestException('Workspace ID is required');
    }

    const templateData = {
      ...dto,
      organization_id: user.organizationId,
      workspace_id: user.workspaceId,
      created_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('whatsapp_templates')
      .insert(templateData)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async getTemplates(user: any) {
    const supabase = this.supabaseService.getAdminClient();
    
    if (!user.workspaceId) {
      throw new BadRequestException('Workspace ID is required');
    }

    const { data, error } = await supabase
      .from('whatsapp_templates')
      .select('*')
      .eq('workspace_id', user.workspaceId)
      .order('created_at', { ascending: false });

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  // === AUTOMATION RULE METHODS ===

  async createAutomationRule(dto: CreateWhatsAppAutomationRuleDto, user: any) {
    const supabase = this.supabaseService.getAdminClient();
    
    if (!user.workspaceId) {
      throw new BadRequestException('Workspace ID is required');
    }

    const ruleData = {
      ...dto,
      organization_id: user.organizationId,
      workspace_id: user.workspaceId,
      created_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('whatsapp_automation_rules')
      .insert(ruleData)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async executeAutomationRule(ruleId: string, leadId: string, eventData: any, user: any) {
    const supabase = this.supabaseService.getAdminClient();
    
    // Get rule details
    const { data: rule, error: ruleError } = await supabase
      .from('whatsapp_automation_rules')
      .select('*')
      .eq('id', ruleId)
      .eq('workspace_id', user.workspaceId)
      .single();

    if (ruleError || !rule) {
      throw new BadRequestException('Automation rule not found');
    }

    // Check if rule is active
    if (!rule.is_active) {
      throw new BadRequestException('Automation rule is not active');
    }

    // Create execution record
    const executionData = {
      rule_id: ruleId,
      lead_id: leadId,
      organization_id: user.organizationId,
      workspace_id: user.workspaceId,
      trigger_event: rule.trigger_event,
      trigger_data: eventData,
      action_type: rule.action_type,
      action_config: rule.action_config,
      status: 'pending',
      scheduled_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    const { data: execution, error: execError } = await supabase
      .from('whatsapp_automation_executions')
      .insert(executionData)
      .select()
      .single();

    if (execError) throw new BadRequestException(execError.message);

    // Execute the action
    try {
      if (rule.action_type === 'send_message') {
        await this.sendMessage({
          to: eventData.phone,
          message: rule.action_config.message_content,
          type: 'text',
        }, user);
      } else if (rule.action_type === 'send_template') {
        await this.sendTemplateMessage(
          eventData.phone,
          rule.action_config.template_name,
          rule.action_config.variables || {},
          user
        );
      } else if (rule.action_type === 'enroll_sequence') {
        await this.enrollLeadInDripSequence(
          rule.action_config.sequence_id,
          leadId,
          'automation_rule',
          user
        );
      }

      // Update execution status
      await supabase
        .from('whatsapp_automation_executions')
        .update({
          status: 'executed',
          executed_at: new Date().toISOString(),
          action_result: { success: true }
        })
        .eq('id', execution.id);

    } catch (error) {
      // Update execution status to failed
      await supabase
        .from('whatsapp_automation_executions')
        .update({
          status: 'failed',
          error_message: error.message,
          executed_at: new Date().toISOString(),
          action_result: { success: false, error: error.message }
        })
        .eq('id', execution.id);

      throw error;
    }

    return execution;
  }

  // === ANALYTICS METHODS ===

  async getCampaignAnalytics(campaignId: string, user: any) {
    const supabase = this.supabaseService.getAdminClient();
    
    if (!user.workspaceId) {
      throw new BadRequestException('Workspace ID is required');
    }

    const { data: campaign, error: campaignError } = await supabase
      .from('whatsapp_campaigns')
      .select('*')
      .eq('id', campaignId)
      .eq('workspace_id', user.workspaceId)
      .single();

    if (campaignError || !campaign) {
      throw new BadRequestException('Campaign not found');
    }

    // Get recipient stats
    const { data: recipients, error: recError } = await supabase
      .from('whatsapp_campaign_recipients')
      .select('status')
      .eq('campaign_id', campaignId);

    if (recError) throw new BadRequestException(recError.message);

    const stats = recipients.reduce((acc: any, r: any) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {});

    const deliveryRate = stats.sent ? Math.round((stats.delivered / stats.sent) * 100) : 0;
    const readRate = stats.delivered ? Math.round((stats.read / stats.delivered) * 100) : 0;
    const replyRate = stats.read ? Math.round((stats.replied / stats.read) * 100) : 0;

    return {
      campaign,
      stats,
      deliveryRate,
      readRate,
      replyRate,
      totalRecipients: campaign.total_recipients,
    };
  }

  private mapLeadToVariables(lead: any, mapping: any): Record<string, any> {
    if (!mapping) return { name: lead.name };
    const variables: Record<string, any> = {};
    Object.entries(mapping).forEach(([key, field]) => {
      variables[key] = lead[field as string] || '';
    });
    return variables;
  }
}
