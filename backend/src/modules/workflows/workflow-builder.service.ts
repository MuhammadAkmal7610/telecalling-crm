import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { EmailService } from '../email/email.service';
import { NotificationsService } from '../notifications/notifications.service';

export interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  category: 'lead_management' | 'communication' | 'automation' | 'custom';
  trigger_type: 'manual' | 'webhook' | 'schedule' | 'event_based' | 'data_change';
  trigger_config: Record<string, any>;
  nodes: WorkflowNode[];
  variables: Record<string, any>;
  settings: Record<string, any>;
  status: 'draft' | 'active' | 'paused' | 'archived';
  version: number;
  is_template: boolean;
  template_category?: string;
  usage_count: number;
  workspace_id: string;
  organization_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'delay' | 'webhook' | 'email' | 'sms' | 'whatsapp' | 'task' | 'notification';
  config: Record<string, any>;
  position: { x: number; y: number };
  connections: Array<{
    from: string;
    to: string;
    condition?: string;
  }>;
}

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  execution_id: string;
  trigger_data: Record<string, any>;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'paused';
  current_node_id?: string;
  execution_context: Record<string, any>;
  error_message?: string;
  error_details?: Record<string, any>;
  started_at: string;
  completed_at?: string;
  duration_ms?: number;
  retry_count: number;
  max_retries: number;
  next_retry_at?: string;
  workspace_id: string;
  organization_id: string;
  triggered_by?: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  template_data: WorkflowDefinition;
  preview_image?: string;
  usage_count: number;
  rating: number;
  is_public: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class WorkflowBuilderService {
  private readonly logger = new Logger(WorkflowBuilderService.name);
  private readonly WORKFLOWS_TABLE = 'workflow_definitions';
  private readonly EXECUTIONS_TABLE = 'workflow_executions';
  private readonly EXECUTION_LOGS_TABLE = 'workflow_execution_logs';
  private readonly TEMPLATES_TABLE = 'workflow_templates';
  private readonly SCHEDULES_TABLE = 'workflow_schedules';
  private readonly WEBHOOKS_TABLE = 'workflow_webhooks';

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly emailService: EmailService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // ==================== WORKFLOW DEFINITIONS ====================

  async createWorkflow(workflowData: Partial<WorkflowDefinition>, user: any) {
    const supabase = this.supabaseService.getAdminClient();
    
    try {
      // Validate workflow structure
      this.validateWorkflow(workflowData);

      const { data, error } = await supabase
        .from(this.WORKFLOWS_TABLE)
        .insert({
          ...workflowData,
          workspace_id: user.workspace_id,
          organization_id: user.organization_id,
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      this.logger.log(`Workflow created: ${workflowData.name}`);
      return data;
    } catch (error) {
      this.logger.error('Error creating workflow:', error);
      throw new BadRequestException('Failed to create workflow');
    }
  }

  async getWorkflows(user: any, category?: string, status?: string) {
    const supabase = this.supabaseService.getAdminClient();
    
    let query = supabase
      .from(this.WORKFLOWS_TABLE)
      .select(`
        *,
        creator:users(id, name, email)
      `)
      .eq('workspace_id', user.workspace_id);

    if (category) {
      query = query.eq('category', category);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async updateWorkflow(id: string, workflowData: Partial<WorkflowDefinition>, user: any) {
    const supabase = this.supabaseService.getAdminClient();
    
    try {
      // Validate workflow structure
      this.validateWorkflow(workflowData);

      const { data, error } = await supabase
        .from(this.WORKFLOWS_TABLE)
        .update({
          ...workflowData,
          version: workflowData.version ? workflowData.version + 1 : 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('workspace_id', user.workspace_id)
        .select()
        .single();

      if (error) throw error;

      this.logger.log(`Workflow updated: ${id}`);
      return data;
    } catch (error) {
      this.logger.error('Error updating workflow:', error);
      throw new BadRequestException('Failed to update workflow');
    }
  }

  async deleteWorkflow(id: string, user: any) {
    const supabase = this.supabaseService.getAdminClient();
    
    const { error } = await supabase
      .from(this.WORKFLOWS_TABLE)
      .delete()
      .eq('id', id)
      .eq('workspace_id', user.workspace_id);

    if (error) throw error;

    this.logger.log(`Workflow deleted: ${id}`);
    return { success: true };
  }

  // ==================== WORKFLOW EXECUTION ====================

  async executeWorkflow(workflowId: string, triggerData: Record<string, any>, user?: any) {
    const supabase = this.supabaseService.getAdminClient();
    
    try {
      // Get workflow definition
      const { data: workflow, error } = await supabase
        .from(this.WORKFLOWS_TABLE)
        .select('*')
        .eq('id', workflowId)
        .eq('status', 'active')
        .single();

      if (error || !workflow) {
        throw new BadRequestException('Workflow not found or inactive');
      }

      // Create execution record
      const executionId = this.generateExecutionId();
      const { data: execution, error: execError } = await supabase
        .from(this.EXECUTIONS_TABLE)
        .insert({
          workflow_id: workflowId,
          execution_id: executionId,
          trigger_data: triggerData,
          status: 'pending',
          execution_context: { ...workflow.variables },
          max_retries: workflow.settings?.maxRetries || 3,
          workspace_id: workflow.workspace_id,
          organization_id: workflow.organization_id,
          triggered_by: user?.id,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (execError) throw execError;

      // Update workflow usage count
      await supabase
        .from(this.WORKFLOWS_TABLE)
        .update({ usage_count: workflow.usage_count + 1 })
        .eq('id', workflowId);

      // Start execution in background
      this.processWorkflowExecution(execution.id, workflow);

      this.logger.log(`Workflow execution started: ${executionId}`);
      return execution;
    } catch (error) {
      this.logger.error('Error executing workflow:', error);
      throw new BadRequestException('Failed to execute workflow');
    }
  }

  private async processWorkflowExecution(executionId: string, workflow: WorkflowDefinition) {
    const supabase = this.supabaseService.getAdminClient();
    
    try {
      // Update execution status to running
      await supabase
        .from(this.EXECUTIONS_TABLE)
        .update({ status: 'running' })
        .eq('id', executionId);

      // Find trigger node
      const triggerNode = workflow.nodes.find(node => node.type === 'trigger');
      if (!triggerNode) {
        throw new Error('No trigger node found in workflow');
      }

      // Process nodes starting from trigger
      await this.processNode(executionId, triggerNode, workflow, {});

      // Mark execution as completed
      await supabase
        .from(this.EXECUTIONS_TABLE)
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString(),
          duration_ms: this.calculateDuration(executionId),
        })
        .eq('id', executionId);

      this.logger.log(`Workflow execution completed: ${executionId}`);
    } catch (error) {
      this.logger.error(`Workflow execution failed: ${executionId}`, error);
      
      // Mark execution as failed
      await supabase
        .from(this.EXECUTIONS_TABLE)
        .update({ 
          status: 'failed',
          error_message: error.message,
          error_details: { stack: error.stack },
          completed_at: new Date().toISOString(),
        })
        .eq('id', executionId);
    }
  }

  private async processNode(
    executionId: string, 
    node: WorkflowNode, 
    workflow: WorkflowDefinition,
    context: Record<string, any>
  ) {
    const supabase = this.supabaseService.getAdminClient();
    
    try {
      // Log node start
      await this.logNodeExecution(executionId, node.id, node.type, 'started', {}, {});

      // Update current node
      await supabase
        .from(this.EXECUTIONS_TABLE)
        .update({ current_node_id: node.id })
        .eq('id', executionId);

      // Process node based on type
      let result = {};
      switch (node.type) {
        case 'trigger':
          result = await this.processTriggerNode(node, context);
          break;
        case 'action':
          result = await this.processActionNode(node, context, workflow);
          break;
        case 'condition':
          result = await this.processConditionNode(node, context);
          break;
        case 'delay':
          result = await this.processDelayNode(node, context);
          break;
        case 'email':
          result = await this.processEmailNode(node, context, workflow);
          break;
        case 'sms':
          result = await this.processSMSNode(node, context, workflow);
          break;
        case 'whatsapp':
          result = await this.processWhatsAppNode(node, context, workflow);
          break;
        case 'task':
          result = await this.processTaskNode(node, context, workflow);
          break;
        case 'notification':
          result = await this.processNotificationNode(node, context, workflow);
          break;
        case 'webhook':
          result = await this.processWebhookNode(node, context);
          break;
        default:
          throw new Error(`Unknown node type: ${node.type}`);
      }

      // Log node completion
      await this.logNodeExecution(executionId, node.id, node.type, 'completed', {}, result);

      // Process connected nodes
      const connections = node.connections.filter(conn => conn.from === node.id);
      for (const connection of connections) {
        const nextNode = workflow.nodes.find(n => n.id === connection.to);
        if (nextNode) {
          // Check condition if exists
          if (connection.condition) {
            const conditionMet = await this.evaluateCondition(connection.condition, result, context);
            if (!conditionMet) continue;
          }
          
          await this.processNode(executionId, nextNode, workflow, { ...context, ...result });
        }
      }

      return result;
    } catch (error) {
      // Log node failure
      await this.logNodeExecution(executionId, node.id, node.type, 'failed', {}, { error: error.message });
      throw error;
    }
  }

  private async processTriggerNode(node: WorkflowNode, context: Record<string, any>) {
    // Trigger nodes don't perform actions, they just pass through data
    return context;
  }

  private async processActionNode(node: WorkflowNode, context: Record<string, any>, workflow: WorkflowDefinition) {
    const { action, target, data } = node.config;
    
    switch (action) {
      case 'update_lead':
        return await this.updateLeadRecord(target, data, context, workflow);
      case 'create_task':
        return await this.createTask(target, data, context, workflow);
      case 'send_notification':
        return await this.sendNotification(target, data, context, workflow);
      case 'call_webhook':
        return await this.callWebhook(target, data, context);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  private async processConditionNode(node: WorkflowNode, context: Record<string, any>) {
    const { conditions } = node.config;
    
    for (const condition of conditions) {
      const result = await this.evaluateCondition(condition.expression, context, {});
      if (!result) {
        return { condition_met: false };
      }
    }
    
    return { condition_met: true };
  }

  private async processDelayNode(node: WorkflowNode, context: Record<string, any>) {
    const { delay_type, delay_value } = node.config;
    
    if (delay_type === 'seconds') {
      await this.sleep(delay_value * 1000);
    } else if (delay_type === 'minutes') {
      await this.sleep(delay_value * 60 * 1000);
    } else if (delay_type === 'hours') {
      await this.sleep(delay_value * 60 * 60 * 1000);
    } else if (delay_type === 'days') {
      await this.sleep(delay_value * 24 * 60 * 60 * 1000);
    }
    
    return { delayed: true };
  }

  private async processEmailNode(node: WorkflowNode, context: Record<string, any>, workflow: WorkflowDefinition) {
    const { template_id, recipient, variables } = node.config;
    
    // Send email using email service
    const result = await this.emailService.sendEmailToRecipient({
      template: { id: template_id },
      sender_email: node.config.from_email,
      sender_name: node.config.from_name,
      reply_to_email: node.config.reply_to,
      track_opens: true,
      track_clicks: true,
    }, { ...context, ...variables }, { workspace_id: workflow.workspace_id, organization_id: workflow.organization_id });
    
    return { email_sent: true, email_id: result.id };
  }

  private async processSMSNode(node: WorkflowNode, context: Record<string, any>, workflow: WorkflowDefinition) {
    // SMS implementation would go here
    return { sms_sent: true };
  }

  private async processWhatsAppNode(node: WorkflowNode, context: Record<string, any>, workflow: WorkflowDefinition) {
    // WhatsApp implementation would go here
    return { whatsapp_sent: true };
  }

  private async processTaskNode(node: WorkflowNode, context: Record<string, any>, workflow: WorkflowDefinition) {
    const supabase = this.supabaseService.getAdminClient();
    const { title, description, assigned_to, due_date, priority } = node.config;
    
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: this.replaceVariables(title, context),
        description: this.replaceVariables(description, context),
        assigned_to: this.replaceVariables(assigned_to, context),
        due_date: this.replaceVariables(due_date, context),
        priority: priority || 'medium',
        workspace_id: workflow.workspace_id,
        organization_id: workflow.organization_id,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    
    return { task_created: true, task_id: data.id };
  }

  private async processNotificationNode(node: WorkflowNode, context: Record<string, any>, workflow: WorkflowDefinition) {
    const { user_id, title, message, type } = node.config;
    
    await this.notificationsService.create(
      this.replaceVariables(user_id, context),
      workflow.organization_id,
      this.replaceVariables(title, context),
      this.replaceVariables(message, context),
      type || 'workflow'
    );
    
    return { notification_sent: true };
  }

  private async processWebhookNode(node: WorkflowNode, context: Record<string, any>) {
    const { url, method, headers, body } = node.config;
    
    const response = await fetch(this.replaceVariables(url, context), {
      method: method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(this.replaceVariables(body, context)),
    });
    
    const responseData = await response.json();
    
    return { webhook_called: true, response: responseData };
  }

  // ==================== WORKFLOW TEMPLATES ====================

  async getTemplates(category?: string) {
    const supabase = this.supabaseService.getAdminClient();
    
    let query = supabase
      .from(this.TEMPLATES_TABLE)
      .select('*')
      .eq('is_public', true);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query.order('usage_count', { ascending: false });

    if (error) throw error;
    return data;
  }

  async createTemplateFromWorkflow(workflowId: string, templateData: Partial<WorkflowTemplate>, user: any) {
    const supabase = this.supabaseService.getAdminClient();
    
    try {
      // Get workflow
      const { data: workflow } = await supabase
        .from(this.WORKFLOWS_TABLE)
        .select('*')
        .eq('id', workflowId)
        .single();

      if (!workflow) {
        throw new BadRequestException('Workflow not found');
      }

      // Create template
      const { data, error } = await supabase
        .from(this.TEMPLATES_TABLE)
        .insert({
          ...templateData,
          template_data: workflow,
          created_by: user.id,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      this.logger.log(`Workflow template created: ${templateData.name}`);
      return data;
    } catch (error) {
      this.logger.error('Error creating workflow template:', error);
      throw new BadRequestException('Failed to create workflow template');
    }
  }

  // ==================== SCHEDULED WORKFLOWS ====================

  async scheduleWorkflow(workflowId: string, scheduleData: any, user: any) {
    const supabase = this.supabaseService.getAdminClient();
    
    try {
      const { data, error } = await supabase
        .from(this.SCHEDULES_TABLE)
        .insert({
          workflow_id: workflowId,
          schedule_type: scheduleData.schedule_type,
          schedule_expression: scheduleData.schedule_expression,
          timezone: scheduleData.timezone || 'UTC',
          workspace_id: user.workspace_id,
          organization_id: user.organization_id,
          created_by: user.id,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      this.logger.log(`Workflow scheduled: ${workflowId}`);
      return data;
    } catch (error) {
      this.logger.error('Error scheduling workflow:', error);
      throw new BadRequestException('Failed to schedule workflow');
    }
  }

  // ==================== ANALYTICS ====================

  async getWorkflowAnalytics(workflowId: string, user: any) {
    const supabase = this.supabaseService.getAdminClient();
    
    try {
      // Get workflow details
      const { data: workflow } = await supabase
        .from(this.WORKFLOWS_TABLE)
        .select('*')
        .eq('id', workflowId)
        .eq('workspace_id', user.workspace_id)
        .single();

      if (!workflow) {
        throw new BadRequestException('Workflow not found');
      }

      // Get execution stats
      const { data: executions } = await supabase
        .from(this.EXECUTIONS_TABLE)
        .select('*')
        .eq('workflow_id', workflowId);

      const totalExecutions = executions?.length || 0;
      const successfulExecutions = executions?.filter(e => e.status === 'completed')?.length || 0;
      const failedExecutions = executions?.filter(e => e.status === 'failed')?.length || 0;
      const runningExecutions = executions?.filter(e => e.status === 'running')?.length || 0;

      const avgDuration = executions?.filter(e => e.duration_ms)
        .reduce((sum, e) => sum + e.duration_ms, 0) / totalExecutions || 0;

      return {
        workflow,
        analytics: {
          totalExecutions,
          successfulExecutions,
          failedExecutions,
          runningExecutions,
          successRate: totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0,
          avgDuration: Math.round(avgDuration),
          lastExecution: executions?.[0]?.started_at,
        },
      };
    } catch (error) {
      this.logger.error('Error getting workflow analytics:', error);
      throw new BadRequestException('Failed to get workflow analytics');
    }
  }

  // ==================== HELPER METHODS ====================

  private validateWorkflow(workflow: Partial<WorkflowDefinition>) {
    if (!workflow.name) {
      throw new BadRequestException('Workflow name is required');
    }
    
    if (!workflow.nodes || workflow.nodes.length === 0) {
      throw new BadRequestException('Workflow must have at least one node');
    }

    // Check for trigger node
    const hasTrigger = workflow.nodes.some(node => node.type === 'trigger');
    if (!hasTrigger) {
      throw new BadRequestException('Workflow must have a trigger node');
    }

    // Validate node connections
    for (const node of workflow.nodes) {
      if (node.connections) {
        for (const connection of node.connections) {
          const targetNode = workflow.nodes.find(n => n.id === connection.to);
          if (!targetNode) {
            throw new BadRequestException(`Invalid connection: node ${connection.to} not found`);
          }
        }
      }
    }
  }

  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async logNodeExecution(
    executionId: string,
    nodeId: string,
    nodeType: string,
    status: string,
    inputData: Record<string, any>,
    outputData: Record<string, any>,
    workspaceId?: string,
    organizationId?: string
  ) {
    const supabase = this.supabaseService.getAdminClient();
    
    try {
      await supabase
        .from(this.EXECUTION_LOGS_TABLE)
        .insert({
          execution_id: executionId,
          node_id: nodeId,
          node_type: nodeType,
          status,
          input_data: inputData,
          output_data: outputData,
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          workspace_id: workspaceId || 'unknown',
          organization_id: organizationId || 'unknown',
        });
    } catch (error) {
      this.logger.error('Error logging node execution:', error);
    }
  }

  private async evaluateCondition(
    expression: string,
    context: Record<string, any>,
    variables: Record<string, any>
  ): Promise<boolean> {
    try {
      // Simple condition evaluation - in production, use a proper expression parser
      const evalContext = { ...context, ...variables };
      
      // Replace variables in expression
      let evalExpression = expression;
      Object.keys(evalContext).forEach(key => {
        const regex = new RegExp(`\\b${key}\\b`, 'g');
        evalExpression = evalExpression.replace(regex, JSON.stringify(evalContext[key]));
      });
      
      // WARNING: This is a simplified evaluation. In production, use a safe expression parser
      return eval(evalExpression);
    } catch (error) {
      this.logger.error('Error evaluating condition:', error);
      return false;
    }
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
  private async updateLeadRecord(target: string, data: Record<string, any>, context: Record<string, any>, workflow: WorkflowDefinition) {
    const supabase = this.supabaseService.getAdminClient();
    
    const { data: result, error } = await supabase
      .from('leads')
      .update({
        name: this.replaceVariables(data.name, context),
        email: this.replaceVariables(data.email, context),
        phone: this.replaceVariables(data.phone, context),
        company: this.replaceVariables(data.company, context),
        workspace_id: workflow.workspace_id,
        organization_id: workflow.organization_id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', target)
      .select()
      .single();

    if (error) throw error;
    
    return { lead_updated: true, lead_id: result.id };
  }

  private async createTask(target: string, data: Record<string, any>, context: Record<string, any>, workflow: WorkflowDefinition) {
    const supabase = this.supabaseService.getAdminClient();
    
    const { data: result, error } = await supabase
      .from('tasks')
      .insert({
        title: this.replaceVariables(data.title, context),
        description: this.replaceVariables(data.description, context),
        assigned_to: this.replaceVariables(data.assigned_to, context),
        due_date: this.replaceVariables(data.due_date, context),
        priority: data.priority || 'medium',
        workspace_id: workflow.workspace_id,
        organization_id: workflow.organization_id,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    
    return { task_created: true, task_id: result.id };
  }

  private async sendNotification(target: string, data: Record<string, any>, context: Record<string, any>, workflow: WorkflowDefinition) {
    await this.notificationsService.create(
      this.replaceVariables(target, context),
      workflow.organization_id,
      this.replaceVariables(data.title, context),
      this.replaceVariables(data.message, context),
      data.type || 'workflow'
    );
    
    return { notification_sent: true };
  }

  private async callWebhook(target: string, data: Record<string, any>, context: Record<string, any>) {
    // Replace variables in data object
    const processedData = Object.keys(data).reduce((acc, key) => {
      acc[key] = this.replaceVariables(String(data[key]), context);
      return acc;
    }, {} as Record<string, any>);

    const response = await fetch(this.replaceVariables(target, context), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(processedData),
    });
    
    const responseData = await response.json();
    
    return { webhook_called: true, response: responseData };
  }

  private async sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private calculateDuration(executionId: string): number {
    // This would calculate the actual duration from start to end
    // For now, return a placeholder
    return 0;
  }
}
