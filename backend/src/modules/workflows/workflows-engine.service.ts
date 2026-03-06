import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class WorkflowsEngineService {
    private readonly logger = new Logger(WorkflowsEngineService.name);
    private readonly TABLE = 'workflows';

    constructor(private readonly supabaseService: SupabaseService) { }

    /**
     * Entry point for triggering workflows on a lead.
     */
    async processLead(lead: any, triggerType: string, context?: any) {
        if (!lead || !lead.id || !lead.organization_id) {
            this.logger.warn('Invalid lead provided to WorkflowsEngineService');
            return;
        }

        const { organization_id, workspace_id } = lead;
        const supabase = this.supabaseService.getAdminClient();

        this.logger.log(`Processing workflows for lead: ${lead.id} (Trigger: ${triggerType})`);

        // 1. Find active workflows for this trigger
        const { data: workflows, error } = await supabase
            .from(this.TABLE)
            .select('*')
            .eq('organization_id', organization_id)
            .eq('workspace_id', workspace_id)
            .eq('is_active', true)
            .contains('trigger', { type: triggerType });

        if (error) {
            this.logger.error(`Error fetching workflows: ${error.message}`);
            return;
        }

        if (!workflows || workflows.length === 0) {
            this.logger.log(`No matching active workflows for lead ${lead.id}`);
            return;
        }

        // 2. Execute actions for each matching workflow
        for (const workflow of workflows) {
            try {
                await this.executeWorkflow(workflow, lead, triggerType, context);
            } catch (err) {
                this.logger.error(`Workflow ${workflow.name} failed for lead ${lead.id}: ${err.message}`);
            }
        }
    }

    /**
     * Execute a complete workflow with conditions and multiple actions
     */
    private async executeWorkflow(workflow: any, lead: any, triggerType: string, context?: any) {
        const { trigger, actions, conditions, id: workflowId } = workflow;
        
        // 1. Check if conditions are met
        if (conditions && !this.evaluateConditions(conditions, lead, context)) {
            this.logger.log(`Workflow ${workflow.name} conditions not met for lead ${lead.id}`);
            return;
        }

        // 2. Execute all actions in sequence
        for (const action of actions) {
            await this.executeAction(action, lead, workflow, context);
        }

        // 3. Log workflow execution
        await this.logWorkflowExecution(workflowId, lead.id, triggerType, 'success');
    }

    /**
     * Evaluate workflow conditions
     */
    private evaluateConditions(conditions: any[], lead: any, context?: any): boolean {
        if (!conditions || conditions.length === 0) return true;

        return conditions.every((condition: any) => {
            const { field, operator, value, logical_operator = 'AND' } = condition;
            
            let fieldValue = this.getFieldValue(field, lead, context);
            return this.compareValues(fieldValue, operator, value);
        });
    }

    /**
     * Get field value from lead or context
     */
    private getFieldValue(field: string, lead: any, context?: any): any {
        if (field.startsWith('context.')) {
            const contextField = field.replace('context.', '');
            return context?.[contextField];
        }
        return lead?.[field];
    }

    /**
     * Compare values based on operator
     */
    private compareValues(fieldValue: any, operator: string, compareValue: any): boolean {
        switch (operator) {
            case 'equals': return fieldValue === compareValue;
            case 'not_equals': return fieldValue !== compareValue;
            case 'contains': return String(fieldValue).includes(String(compareValue));
            case 'not_contains': return !String(fieldValue).includes(String(compareValue));
            case 'greater_than': return Number(fieldValue) > Number(compareValue);
            case 'less_than': return Number(fieldValue) < Number(compareValue);
            case 'greater_equal': return Number(fieldValue) >= Number(compareValue);
            case 'less_equal': return Number(fieldValue) <= Number(compareValue);
            case 'in': return Array.isArray(compareValue) && compareValue.includes(fieldValue);
            case 'not_in': return Array.isArray(compareValue) && !compareValue.includes(fieldValue);
            case 'is_empty': return !fieldValue || fieldValue === '';
            case 'is_not_empty': return fieldValue && fieldValue !== '';
            default: return true;
        }
    }

    /**
     * Execute individual action with enhanced capabilities
     */
    private async executeAction(action: any, lead: any, workflow: any, context?: any) {
        const { type, config, delay_minutes = 0 } = action;
        
        // Apply delay if specified
        if (delay_minutes > 0) {
            this.logger.log(`Delaying action ${type} for ${delay_minutes} minutes`);
            await this.delay(delay_minutes * 60 * 1000);
        }

        const supabase = this.supabaseService.getAdminClient();

        switch (type) {
            case 'assign_to':
                await this.handleAssignmentAction(config, lead, workflow, supabase);
                break;
                
            case 'update_field':
                await this.handleUpdateFieldAction(config, lead, supabase);
                break;
                
            case 'send_email':
                await this.handleSendEmailAction(config, lead, supabase);
                break;
                
            case 'send_sms':
                await this.handleSendSMSAction(config, lead, supabase);
                break;
                
            case 'create_task':
                await this.handleCreateTaskAction(config, lead, supabase);
                break;
                
            case 'webhook_call':
                await this.handleWebhookAction(config, lead, supabase);
                break;
                
            case 'add_tag':
                await this.handleAddTagAction(config, lead, supabase);
                break;
                
            case 'remove_tag':
                await this.handleRemoveTagAction(config, lead, supabase);
                break;
                
            default:
                this.logger.warn(`Unsupported action type: ${type}`);
        }
    }

    /**
     * Handle assignment action (enhanced)
     */
    private async handleAssignmentAction(config: any, lead: any, workflow: any, supabase: any) {
        const { assignee_type, assignee_value, round_robin_index = 0 } = config;
        let assigneeId: string | null = null;

        if (assignee_type === 'round_robin' && Array.isArray(assignee_value)) {
            const users = assignee_value;
            const index = (round_robin_index || 0) % users.length;
            assigneeId = users[index];

            // Update round robin index
            await supabase
                .from(this.TABLE)
                .update({ round_robin_index: (round_robin_index || 0) + 1 })
                .eq('id', workflow.id);
        } else if (assignee_type === 'fixed') {
            assigneeId = assignee_value;
        } else if (assignee_type === 'field') {
            assigneeId = lead[assignee_value];
        }

        if (assigneeId) {
            await supabase
                .from('leads')
                .update({
                    assignee_id: assigneeId,
                    updated_at: new Date().toISOString()
                })
                .eq('id', lead.id);

            await this.createActivity(lead, 'assignment', {
                workflow_name: workflow.name,
                assignee_id: assigneeId,
                method: assignee_type
            });
        }
    }

    /**
     * Handle field update action
     */
    private async handleUpdateFieldAction(config: any, lead: any, supabase: any) {
        const { field, value, expression } = config;
        let updateValue = value;

        if (expression) {
            updateValue = this.evaluateExpression(expression, lead);
        }

        await supabase
            .from('leads')
            .update({
                [field]: updateValue,
                updated_at: new Date().toISOString()
            })
            .eq('id', lead.id);

        await this.createActivity(lead, 'field_update', {
            workflow_name: 'System',
            field,
            old_value: lead[field],
            new_value: updateValue
        });
    }

    /**
     * Handle send email action
     */
    private async handleSendEmailAction(config: any, lead: any, supabase: any) {
        const { template_id, to, subject, body } = config;
        
        const emailData = {
            lead_id: lead.id,
            template_id,
            recipient: this.resolveVariables(to, lead),
            subject: this.resolveVariables(subject, lead),
            body: this.resolveVariables(body, lead),
            type: 'email',
            status: 'pending'
        };

        await supabase.from('email_queue').insert(emailData);
        
        await this.createActivity(lead, 'email_sent', {
            template_id,
            recipient: emailData.recipient
        });
    }

    /**
     * Handle send SMS action
     */
    private async handleSendSMSAction(config: any, lead: any, supabase: any) {
        const { template_id, to, message } = config;
        
        const smsData = {
            lead_id: lead.id,
            template_id,
            recipient: this.resolveVariables(to, lead),
            message: this.resolveVariables(message, lead),
            type: 'sms',
            status: 'pending'
        };

        await supabase.from('sms_queue').insert(smsData);
        
        await this.createActivity(lead, 'sms_sent', {
            template_id,
            recipient: smsData.recipient
        });
    }

    /**
     * Handle create task action
     */
    private async handleCreateTaskAction(config: any, lead: any, supabase: any) {
        const { title, description, assignee_id, due_date, priority } = config;
        
        const taskData = {
            lead_id: lead.id,
            title: this.resolveVariables(title, lead),
            description: this.resolveVariables(description, lead),
            assignee_id: this.resolveVariables(assignee_id, lead),
            due_date: this.resolveVariables(due_date, lead),
            priority: priority || 'medium',
            organization_id: lead.organization_id,
            workspace_id: lead.workspace_id,
            type: 'automated'
        };

        await supabase.from('tasks').insert(taskData);
        
        await this.createActivity(lead, 'task_created', {
            task_title: taskData.title
        });
    }

    /**
     * Handle webhook call action
     */
    private async handleWebhookAction(config: any, lead: any, supabase: any) {
        const { url, method = 'POST', headers = {}, body } = config;
        
        const webhookData = {
            lead_id: lead.id,
            url: this.resolveVariables(url, lead),
            method,
            headers: JSON.stringify(headers),
            body: this.resolveVariables(JSON.stringify(body), lead),
            status: 'pending',
            attempts: 0
        };

        await supabase.from('webhook_queue').insert(webhookData);
        
        await this.createActivity(lead, 'webhook_triggered', {
            url: webhookData.url
        });
    }

    /**
     * Handle add tag action
     */
    private async handleAddTagAction(config: any, lead: any, supabase: any) {
        const { tags } = config;
        const currentTags = lead.tags || [];
        const newTags = [...new Set([...currentTags, ...tags])];
        
        await supabase
            .from('leads')
            .update({
                tags: newTags,
                updated_at: new Date().toISOString()
            })
            .eq('id', lead.id);
    }

    /**
     * Handle remove tag action
     */
    private async handleRemoveTagAction(config: any, lead: any, supabase: any) {
        const { tags } = config;
        const currentTags = lead.tags || [];
        const newTags = currentTags.filter((tag: any) => !tags.includes(tag));
        
        await supabase
            .from('leads')
            .update({
                tags: newTags,
                updated_at: new Date().toISOString()
            })
            .eq('id', lead.id);
    }

    /**
     * Resolve variables in templates
     */
    private resolveVariables(text: string, lead: any): string {
        if (!text || typeof text !== 'string') return text;
        
        return text.replace(/\{\{(\w+)\}\}/g, (match, field) => {
            return lead[field] || match;
        });
    }

    /**
     * Evaluate expressions
     */
    private evaluateExpression(expression: string, lead: any): any {
        // Simple expression evaluation - can be enhanced
        try {
            return eval(expression.replace(/\blead\.(\w+)\b/g, 'lead.$1'));
        } catch {
            return expression;
        }
    }

    /**
     * Create activity log
     */
    private async createActivity(lead: any, type: string, details: any) {
        const supabase = this.supabaseService.getAdminClient();
        
        await supabase.from('activities').insert({
            organization_id: lead.organization_id,
            workspace_id: lead.workspace_id,
            lead_id: lead.id,
            type,
            details,
            created_at: new Date().toISOString()
        });
    }

    /**
     * Log workflow execution
     */
    private async logWorkflowExecution(workflowId: string, leadId: string, triggerType: string, status: string) {
        const supabase = this.supabaseService.getAdminClient();
        
        await supabase.from('workflow_executions').insert({
            workflow_id: workflowId,
            lead_id: leadId,
            trigger_type: triggerType,
            status,
            executed_at: new Date().toISOString()
        });
    }

    /**
     * Delay execution
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
