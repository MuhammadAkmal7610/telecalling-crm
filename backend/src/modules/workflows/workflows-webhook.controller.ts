import { Controller, Post, Body, Param, Headers, Query, BadRequestException, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WorkflowsEngineService } from './workflows-engine.service';
import { SupabaseService } from '../supabase/supabase.service';

@ApiTags('Workflows')
@Controller('webhooks/workflows')
export class WorkflowsWebhookController {
    private readonly logger = new Logger(WorkflowsWebhookController.name);

    constructor(
        private readonly workflowsEngineService: WorkflowsEngineService,
        private readonly supabaseService: SupabaseService
    ) {}

    @Post(':slug')
    @ApiOperation({ summary: 'Receive external webhook to trigger a workflow' })
    async handleInbound(
        @Param('slug') slug: string,
        @Body() body: any,
        @Headers() headers: any,
        @Query('token') token?: string
    ) {
        this.logger.log(`Received webhook for slug: ${slug}`);
        
        const supabase = this.supabaseService.getAdminClient();
        
        // Find workflow by webhook slug
        const { data: workflow, error } = await supabase
            .from('workflows')
            .select('*')
            .eq('trigger->type', 'webhook')
            .eq('trigger->config->slug', slug)
            .eq('is_active', true)
            .single();

        if (error || !workflow) {
            this.logger.warn(`No active workflow found for slug: ${slug}`);
            throw new BadRequestException('Invalid webhook slug or workflow is inactive');
        }

        // Security check: If workflow has a secret/token defined, validate it
        const workflowToken = workflow.trigger?.config?.token;
        if (workflowToken && token !== workflowToken) {
            this.logger.warn(`Invalid token for workflow ${workflow.id}`);
            throw new BadRequestException('Invalid authentication token');
        }

        // Process trigger data
        const triggerData = {
            body,
            headers,
            received_at: new Date().toISOString()
        };

        // Lead Identification Logic
        let lead: any = null;
        const email = body.email || body.lead_email || body.Email;
        const phone = body.phone || body.lead_phone || body.Phone || body.mobile;

        if (email || phone) {
            // Try to find existing lead
            const { data: existingLead } = await supabase
                .from('leads')
                .select('*')
                .eq('organization_id', workflow.organization_id)
                .or(`email.eq.${email},phone.eq.${phone}`)
                .limit(1)
                .single();
            
            lead = existingLead;
        }

        // If no lead found and workflow is configured to create one
        if (!lead && workflow.trigger?.config?.create_lead !== false) {
            const { data: newLead, error: createError } = await supabase
                .from('leads')
                .insert({
                    organization_id: workflow.organization_id,
                    workspace_id: workflow.workspace_id,
                    name: body.name || body.full_name || 'New Webhook Lead',
                    email: email,
                    phone: phone,
                    source: body.source || 'webhook_' + slug,
                    data: body
                })
                .select()
                .single();
            
            if (createError) {
                this.logger.error(`Failed to create lead from webhook: ${createError.message}`);
            } else {
                lead = newLead;
            }
        }

        // Process the workflow
        this.workflowsEngineService.processLead(
            lead || { id: 'generic_event', ...body },
            'webhook',
            { 
                workflow_data: workflow, 
                trigger_data: triggerData,
                payload: body
            }
        ).catch(err => {
            this.logger.error(`Error processing webhook workflow ${workflow.id}: ${err.message}`);
        });

        return { 
            success: true, 
            message: 'Webhook received',
            workflow_id: workflow.id,
            lead_id: lead?.id
        };
    }
}
