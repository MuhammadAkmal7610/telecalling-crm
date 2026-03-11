import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { NotificationsService } from '../notifications/notifications.service';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  html_content?: string;
  category: 'marketing' | 'transactional' | 'automation';
  variables: Array<{ name: string; type: string; label: string }>;
  status: 'draft' | 'active' | 'archived';
  workspace_id: string;
  organization_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface EmailCampaign {
  id: string;
  name: string;
  description?: string;
  template_id?: string;
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'paused' | 'cancelled';
  schedule_type: 'immediate' | 'scheduled' | 'recurring';
  scheduled_at?: string;
  target_audience: {
    leads?: string[];
    filters?: Record<string, any>;
    segments?: string[];
  };
  sender_email: string;
  sender_name: string;
  reply_to_email?: string;
  track_opens: boolean;
  track_clicks: boolean;
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  opened_count: number;
  clicked_count: number;
  bounced_count: number;
  unsubscribed_count: number;
  workspace_id: string;
  organization_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface EmailLog {
  id: string;
  campaign_id?: string;
  template_id?: string;
  recipient_email: string;
  recipient_name?: string;
  lead_id?: string;
  subject: string;
  content?: string;
  status: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'unsubscribed' | 'failed';
  sent_at?: string;
  delivered_at?: string;
  opened_at?: string;
  clicked_at?: string;
  bounced_at?: string;
  unsubscribed_at?: string;
  error_message?: string;
  external_id?: string;
  tracking_id?: string;
  variables_used: Record<string, any>;
  workspace_id: string;
  organization_id: string;
  created_at: string;
}

export interface EmailAutomation {
  id: string;
  name: string;
  description?: string;
  trigger_type: 'lead_created' | 'lead_status_change' | 'time_based' | 'webhook';
  trigger_config: Record<string, any>;
  conditions: Array<{
    field: string;
    operator: string;
    value: any;
  }>;
  actions: Array<{
    type: 'send_email' | 'update_lead' | 'create_task' | 'notify_user';
    config: Record<string, any>;
  }>;
  is_active: boolean;
  trigger_count: number;
  last_triggered_at?: string;
  workspace_id: string;
  organization_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly TEMPLATES_TABLE = 'email_templates';
  private readonly CAMPAIGNS_TABLE = 'email_campaigns';
  private readonly LOGS_TABLE = 'email_logs';
  private readonly AUTOMATION_TABLE = 'email_automation';
  private readonly AUTOMATION_LOGS_TABLE = 'email_automation_logs';

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // ==================== EMAIL TEMPLATES ====================

  async createTemplate(templateData: Partial<EmailTemplate>, user: any) {
    const supabase = this.supabaseService.getAdminClient();
    
    try {
      const { data, error } = await supabase
        .from(this.TEMPLATES_TABLE)
        .insert({
          ...templateData,
          workspace_id: user.workspace_id,
          organization_id: user.organization_id,
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      this.logger.log(`Email template created: ${templateData.name}`);
      return data;
    } catch (error) {
      this.logger.error('Error creating email template:', error);
      throw new BadRequestException('Failed to create email template');
    }
  }

  async getTemplates(user: any, category?: string) {
    const supabase = this.supabaseService.getAdminClient();
    
    let query = supabase
      .from(this.TEMPLATES_TABLE)
      .select('*')
      .eq('workspace_id', user.workspace_id);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      this.logger.error('Error fetching templates:', error);
      return [];
    }
    return data || [];
  }

  async updateTemplate(id: string, templateData: Partial<EmailTemplate>, user: any) {
    const supabase = this.supabaseService.getAdminClient();
    
    try {
      const { data, error } = await supabase
        .from(this.TEMPLATES_TABLE)
        .update({
          ...templateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('workspace_id', user.workspace_id)
        .select()
        .single();

      if (error) throw error;

      this.logger.log(`Email template updated: ${id}`);
      return data;
    } catch (error) {
      this.logger.error('Error updating email template:', error);
      throw new BadRequestException('Failed to update email template');
    }
  }

  async deleteTemplate(id: string, user: any) {
    const supabase = this.supabaseService.getAdminClient();
    
    const { error } = await supabase
      .from(this.TEMPLATES_TABLE)
      .delete()
      .eq('id', id)
      .eq('workspace_id', user.workspace_id);

    if (error) throw error;

    this.logger.log(`Email template deleted: ${id}`);
    return { success: true };
  }

  // ==================== EMAIL CAMPAIGNS ====================

  async createCampaign(campaignData: Partial<EmailCampaign>, user: any) {
    const supabase = this.supabaseService.getAdminClient();
    
    try {
      // Calculate recipients
      const recipients = await this.calculateRecipients(
        campaignData.target_audience,
        user.workspace_id,
        user.organization_id
      );

      const { data, error } = await supabase
        .from(this.CAMPAIGNS_TABLE)
        .insert({
          ...campaignData,
          total_recipients: recipients.length,
          workspace_id: user.workspace_id,
          organization_id: user.organization_id,
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // If immediate schedule, start sending
      if (campaignData.schedule_type === 'immediate') {
        await this.executeCampaign(data.id, user);
      }

      this.logger.log(`Email campaign created: ${campaignData.name}`);
      return data;
    } catch (error) {
      this.logger.error('Error creating email campaign:', error);
      throw new BadRequestException('Failed to create email campaign');
    }
  }

  async getCampaigns(user: any, status?: string) {
    const supabase = this.supabaseService.getAdminClient();
    
    let query = supabase
      .from(this.CAMPAIGNS_TABLE)
      .select(`
        *,
        template:email_templates(id, name, subject),
        creator:users(id, name, email)
      `)
      .eq('workspace_id', user.workspace_id);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      this.logger.error('Error fetching campaigns:', error);
      // Return empty array if table doesn't exist or other error
      return [];
    }
    return data || [];
  }

  async executeCampaign(campaignId: string, user: any) {
    const supabase = this.supabaseService.getAdminClient();
    
    try {
      // Get campaign details
      const { data: campaign, error } = await supabase
        .from(this.CAMPAIGNS_TABLE)
        .select(`
          *,
          template:email_templates(*)
        `)
        .eq('id', campaignId)
        .eq('workspace_id', user.workspace_id)
        .single();

      if (error || !campaign) {
        throw new BadRequestException('Campaign not found');
      }

      // Update campaign status
      await supabase
        .from(this.CAMPAIGNS_TABLE)
        .update({ status: 'running', updated_at: new Date().toISOString() })
        .eq('id', campaignId);

      // Get recipients
      const recipients = await this.calculateRecipients(
        campaign.target_audience,
        user.workspace_id,
        user.organization_id
      );

      // Send emails to recipients
      for (const recipient of recipients) {
        await this.sendEmailToRecipient(campaign, recipient, user);
      }

      // Update campaign status
      await supabase
        .from(this.CAMPAIGNS_TABLE)
        .update({ 
          status: 'completed', 
          updated_at: new Date().toISOString(),
          sent_count: recipients.length
        })
        .eq('id', campaignId);

      this.logger.log(`Campaign executed: ${campaign.name}, sent to ${recipients.length} recipients`);
      return { success: true, recipients: recipients.length };
    } catch (error) {
      this.logger.error('Error executing campaign:', error);
      
      // Update campaign status to failed
      await supabase
        .from(this.CAMPAIGNS_TABLE)
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', campaignId);
      
      throw new BadRequestException('Failed to execute campaign');
    }
  }

  public async sendEmailToRecipient(campaign: any, recipient: any, user: any) {
    const supabase = this.supabaseService.getAdminClient();
    
    try {
      // Prepare email content
      const subject = this.replaceVariables(campaign.template?.subject || campaign.name, recipient);
      const content = this.replaceVariables(campaign.template?.content || '', recipient);
      const htmlContent = campaign.template?.html_content 
        ? this.replaceVariables(campaign.template.html_content, recipient)
        : null;

      // Create email log
      const { data: emailLog, error } = await supabase
        .from(this.LOGS_TABLE)
        .insert({
          campaign_id: campaign.id,
          template_id: campaign.template_id,
          recipient_email: recipient.email,
          recipient_name: recipient.name,
          lead_id: recipient.id,
          subject,
          content,
          status: 'pending',
          variables_used: recipient,
          workspace_id: user.workspace_id,
          organization_id: user.organization_id,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Send email via provider (SendGrid, SES, etc.)
      const emailResult = await this.sendEmail({
        to: recipient.email,
        from: campaign.sender_email,
        senderName: campaign.sender_name,
        replyTo: campaign.reply_to_email,
        subject,
        content,
        htmlContent: htmlContent || undefined,
        trackingId: emailLog.id,
      });

      // Update email log
      await supabase
        .from(this.LOGS_TABLE)
        .update({
          status: 'sent',
          external_id: emailResult.messageId,
          sent_at: new Date().toISOString(),
        })
        .eq('id', emailLog.id);

      return emailLog;
    } catch (error) {
      this.logger.error('Error sending email to recipient:', error);
      throw error;
    }
  }

  private async sendEmail(emailData: {
    to: string;
    from: string;
    senderName?: string;
    replyTo?: string;
    subject: string;
    content: string;
    htmlContent?: string;
    trackingId?: string;
  }) {
    // This would integrate with your email provider (SendGrid, AWS SES, etc.)
    // For now, return a mock response
    
    const config = await this.getEmailConfig();
    
    if (config.provider === 'sendgrid') {
      return this.sendViaSendGrid(emailData, config);
    } else if (config.provider === 'aws_ses') {
      return this.sendViaSES(emailData, config);
    }
    
    throw new BadRequestException('Email provider not configured');
  }

  private async sendViaSendGrid(emailData: any, config: any) {
    // SendGrid implementation
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(config.apiKey);
    
    const msg = {
      to: emailData.to,
      from: {
        email: emailData.from,
        name: emailData.senderName || 'CRM',
      },
      replyTo: emailData.replyTo,
      subject: emailData.subject,
      text: emailData.content,
      html: emailData.htmlContent,
      trackingSettings: {
        clickTracking: { enable: true },
        openTracking: { enable: true },
      },
      customArgs: {
        tracking_id: emailData.trackingId,
      },
    };
    
    const result = await sgMail.send(msg);
    return {
      messageId: result[0]?.headers?.['x-message-id'],
      status: 'sent',
    };
  }

  private async sendViaSES(emailData: any, config: any) {
    // AWS SES implementation
    const AWS = require('aws-sdk');
    const ses = new AWS.SES({
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
      region: config.region,
    });
    
    const params = {
      Destination: { ToAddresses: [emailData.to] },
      Message: {
        Body: {
          Text: { Charset: 'UTF-8', Data: emailData.content },
          ...(emailData.htmlContent && {
            Html: { Charset: 'UTF-8', Data: emailData.htmlContent },
          }),
        },
        Subject: { Charset: 'UTF-8', Data: emailData.subject },
      },
      Source: emailData.from,
      ReplyToAddresses: emailData.replyTo ? [emailData.replyTo] : undefined,
      Tags: emailData.trackingId ? [{ Name: 'tracking_id', Value: emailData.trackingId }] : [],
    };
    
    const result = await ses.sendEmail(params).promise();
    return {
      messageId: result.MessageId,
      status: 'sent',
    };
  }

  // ==================== EMAIL AUTOMATION ====================

  async createAutomation(automationData: Partial<EmailAutomation>, user: any) {
    const supabase = this.supabaseService.getAdminClient();
    
    try {
      const { data, error } = await supabase
        .from(this.AUTOMATION_TABLE)
        .insert({
          ...automationData,
          workspace_id: user.workspace_id,
          organization_id: user.organization_id,
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      this.logger.log(`Email automation created: ${automationData.name}`);
      return data;
    } catch (error) {
      this.logger.error('Error creating email automation:', error);
      throw new BadRequestException('Failed to create email automation');
    }
  }

  async getAutomations(user: any) {
    const supabase = this.supabaseService.getAdminClient();
    
    const { data, error } = await supabase
      .from(this.AUTOMATION_TABLE)
      .select(`
        *,
        creator:users(id, name, email)
      `)
      .eq('workspace_id', user.workspace_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async triggerAutomation(automationId: string, triggerData: any, user: any) {
    const supabase = this.supabaseService.getAdminClient();
    
    try {
      // Get automation details
      const { data: automation, error } = await supabase
        .from(this.AUTOMATION_TABLE)
        .select('*')
        .eq('id', automationId)
        .eq('workspace_id', user.workspace_id)
        .eq('is_active', true)
        .single();

      if (error || !automation) {
        throw new BadRequestException('Automation not found or inactive');
      }

      // Check conditions
      const conditionsMet = await this.checkConditions(automation.conditions, triggerData);
      
      if (!conditionsMet) {
        return { success: false, reason: 'Conditions not met' };
      }

      // Execute actions
      for (const action of automation.actions) {
        await this.executeAction(action, triggerData, user);
      }

      // Update automation stats
      await supabase
        .from(this.AUTOMATION_TABLE)
        .update({
          trigger_count: automation.trigger_count + 1,
          last_triggered_at: new Date().toISOString(),
        })
        .eq('id', automationId);

      // Log execution
      await supabase
        .from(this.AUTOMATION_LOGS_TABLE)
        .insert({
          automation_id: automationId,
          trigger_data: triggerData,
          conditions_met: true,
          actions_executed: automation.actions,
          execution_status: 'completed',
          workspace_id: user.workspace_id,
          organization_id: user.organization_id,
          created_at: new Date().toISOString(),
        });

      this.logger.log(`Automation triggered: ${automation.name}`);
      return { success: true };
    } catch (error) {
      this.logger.error('Error triggering automation:', error);
      throw new BadRequestException('Failed to trigger automation');
    }
  }

  // ==================== ANALYTICS ====================

  async getCampaignAnalytics(campaignId: string, user: any) {
    const supabase = this.supabaseService.getAdminClient();
    
    try {
      const { data: campaign, error } = await supabase
        .from(this.CAMPAIGNS_TABLE)
        .select('*')
        .eq('id', campaignId)
        .eq('workspace_id', user.workspace_id)
        .single();

      if (error || !campaign) {
        throw new BadRequestException('Campaign not found');
      }

      // Get detailed logs
      const { data: logs } = await supabase
        .from(this.LOGS_TABLE)
        .select('*')
        .eq('campaign_id', campaignId);

      const analytics = {
        campaign,
        totalRecipients: campaign.total_recipients,
        sentCount: campaign.sent_count,
        deliveredCount: campaign.delivered_count,
        openedCount: campaign.opened_count,
        clickedCount: campaign.clicked_count,
        bouncedCount: campaign.bounced_count,
        unsubscribedCount: campaign.unsubscribed_count,
        deliveryRate: campaign.sent_count > 0 ? (campaign.delivered_count / campaign.sent_count) * 100 : 0,
        openRate: campaign.delivered_count > 0 ? (campaign.opened_count / campaign.delivered_count) * 100 : 0,
        clickRate: campaign.opened_count > 0 ? (campaign.clicked_count / campaign.opened_count) * 100 : 0,
        bounceRate: campaign.sent_count > 0 ? (campaign.bounced_count / campaign.sent_count) * 100 : 0,
        logs: logs || [],
      };

      return analytics;
    } catch (error) {
      this.logger.error('Error getting campaign analytics:', error);
      throw new BadRequestException('Failed to get campaign analytics');
    }
  }

  async getEmailAnalytics(user: any, timeRange: string = 'month') {
    const supabase = this.supabaseService.getAdminClient();
    
    try {
      const dateFrom = this.getDateFrom(timeRange);
      
      const { data: logs, error } = await supabase
        .from(this.LOGS_TABLE)
        .select('*')
        .eq('workspace_id', user.workspace_id)
        .gte('created_at', dateFrom.toISOString());

      if (error) throw error;

      const totalEmails = logs?.length || 0;
      const sentEmails = logs?.filter(l => l.status === 'sent')?.length || 0;
      const deliveredEmails = logs?.filter(l => l.status === 'delivered')?.length || 0;
      const openedEmails = logs?.filter(l => l.status === 'opened')?.length || 0;
      const clickedEmails = logs?.filter(l => l.status === 'clicked')?.length || 0;
      const bouncedEmails = logs?.filter(l => l.status === 'bounced')?.length || 0;

      return {
        totalEmails,
        sentEmails,
        deliveredEmails,
        openedEmails,
        clickedEmails,
        bouncedEmails,
        deliveryRate: sentEmails > 0 ? (deliveredEmails / sentEmails) * 100 : 0,
        openRate: deliveredEmails > 0 ? (openedEmails / deliveredEmails) * 100 : 0,
        clickRate: openedEmails > 0 ? (clickedEmails / openedEmails) * 100 : 0,
        bounceRate: sentEmails > 0 ? (bouncedEmails / sentEmails) * 100 : 0,
        timeRange,
      };
    } catch (error) {
      this.logger.error('Error getting email analytics:', error);
      throw new BadRequestException('Failed to get email analytics');
    }
  }

  // ==================== HELPER METHODS ====================

  private async calculateRecipients(targetAudience: any, workspaceId: string, organizationId: string) {
    const supabase = this.supabaseService.getAdminClient();
    
    if (targetAudience.leads && targetAudience.leads.length > 0) {
      // Specific leads
      const { data } = await supabase
        .from('leads')
        .select('*')
        .in('id', targetAudience.leads)
        .eq('workspace_id', workspaceId);
      return data || [];
    } else if (targetAudience.filters) {
      // Filter-based leads
      let query = supabase
        .from('leads')
        .select('*')
        .eq('workspace_id', workspaceId);

      // Apply filters
      Object.entries(targetAudience.filters).forEach(([field, filter]: [string, any]) => {
        if (filter.operator === 'equals') {
          query = query.eq(field, filter.value);
        } else if (filter.operator === 'contains') {
          query = query.ilike(field, `%${filter.value}%`);
        } else if (filter.operator === 'in') {
          query = query.in(field, filter.value);
        }
      });

      const { data } = await query;
      return data || [];
    }

    return [];
  }

  private replaceVariables(text: string, variables: Record<string, any>): string {
    if (!text) return text;
    
    let result = text;
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      result = result.replace(new RegExp(placeholder, 'g'), String(value));
    });
    
    return result;
  }

  private async checkConditions(conditions: any[], data: any): Promise<boolean> {
    for (const condition of conditions) {
      const fieldValue = data[condition.field];
      let conditionMet = false;

      switch (condition.operator) {
        case 'equals':
          conditionMet = fieldValue === condition.value;
          break;
        case 'contains':
          conditionMet = String(fieldValue).includes(condition.value);
          break;
        case 'greater_than':
          conditionMet = Number(fieldValue) > Number(condition.value);
          break;
        case 'less_than':
          conditionMet = Number(fieldValue) < Number(condition.value);
          break;
        case 'in':
          conditionMet = Array.isArray(condition.value) && condition.value.includes(fieldValue);
          break;
      }

      if (!conditionMet) return false;
    }

    return true;
  }

  private async executeAction(action: any, data: any, user: any) {
    const supabase = this.supabaseService.getAdminClient();
    
    switch (action.type) {
      case 'send_email':
        await this.sendAutomatedEmail(action.config, data, user);
        break;
      case 'update_lead':
        await supabase
          .from('leads')
          .update(action.config.updates)
          .eq('id', data.lead_id);
        break;
      case 'create_task':
        await supabase
          .from('tasks')
          .insert({
            ...action.config,
            lead_id: data.lead_id,
            workspace_id: user.workspace_id,
            organization_id: user.organization_id,
            created_by: user.id,
            created_at: new Date().toISOString(),
          });
        break;
      case 'notify_user':
        await this.notificationsService.create(
          action.config.user_id,
          user.organization_id,
          action.config.title,
          action.config.message,
          'automation'
        );
        break;
    }
  }

  private async sendAutomatedEmail(config: any, data: any, user: any) {
    const supabase = this.supabaseService.getAdminClient();
    
    // Get template
    const { data: template } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', config.template_id)
      .eq('workspace_id', user.workspace_id)
      .single();

    if (!template) return;

    // Send email
    await this.sendEmailToRecipient({
      template,
      sender_email: config.from_email,
      sender_name: config.from_name,
      reply_to_email: config.reply_to,
      track_opens: true,
      track_clicks: true,
    }, data, user);
  }

  private async getEmailConfig() {
    const supabase = this.supabaseService.getAdminClient();
    
    const { data, error } = await supabase
      .from('integrations')
      .select('config')
      .eq('type', 'email')
      .eq('status', 'active')
      .single();

    if (error || !data) {
      throw new BadRequestException('Email integration not configured');
    }

    return data.config;
  }

  private getDateFrom(timeRange: string): Date {
    const now = new Date();
    switch (timeRange) {
      case 'day':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'month':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case 'year':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }
}
