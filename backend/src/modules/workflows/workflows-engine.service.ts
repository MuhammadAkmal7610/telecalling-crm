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
    async processLead(lead: any) {
        if (!lead || !lead.id || !lead.organization_id) {
            this.logger.warn('Invalid lead provided to WorkflowsEngineService');
            return;
        }

        const { organization_id, source } = lead;
        const supabase = this.supabaseService.getAdminClient();

        this.logger.log(`Processing workflows for lead: ${lead.id} (Source: ${source})`);

        // 1. Find active workflows for this trigger
        // We look for triggers of type 'lead_source' that match the lead's source
        const { data: workflows, error } = await supabase
            .from(this.TABLE)
            .select('*')
            .eq('organization_id', organization_id)
            .eq('workspace_id', lead.workspace_id)
            .eq('is_active', true)
            .contains('trigger', { type: 'lead_source', value: source });

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
                await this.executeAction(workflow, lead);
            } catch (err) {
                this.logger.error(`Workflow ${workflow.name} failed for lead ${lead.id}: ${err.message}`);
            }
        }
    }

    private async executeAction(workflow: any, lead: any) {
        const { action, id: workflowId, round_robin_index = 0 } = workflow;
        const supabase = this.supabaseService.getAdminClient();

        // Currently supported action: 'assign_to'
        // format: { type: 'assign_to', value: 'user-uuid' } OR { type: 'assign_to', value: ['u1', 'u2'] }
        if (action?.type === 'assign_to') {
            let assigneeId: string | null = null;

            if (Array.isArray(action.value)) {
                // ROUND-ROBIN Logic
                if (action.value.length === 0) return;

                const users = action.value;
                const index = (round_robin_index || 0) % users.length;
                assigneeId = users[index];

                // Increment index in DB for next time
                await supabase
                    .from(this.TABLE)
                    .update({ round_robin_index: (round_robin_index || 0) + 1 })
                    .eq('id', workflowId);

                this.logger.log(`Round-robin: Selected index ${index} (${assigneeId}) for workflow ${workflow.name} (Total users: ${users.length})`);
            } else {
                // FIXED Assignment
                assigneeId = action.value;
            }

            if (assigneeId) {
                // Update the lead's assignee
                const { error: updateError } = await supabase
                    .from('leads')
                    .update({
                        assignee_id: assigneeId,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', lead.id);

                if (updateError) throw new Error(updateError.message);

                // Create an activity log entry
                await supabase.from('activities').insert({
                    organization_id: lead.organization_id,
                    workspace_id: lead.workspace_id,
                    lead_id: lead.id,
                    type: 'assignment',
                    details: {
                        workflow_name: workflow.name,
                        assignee_id: assigneeId,
                        method: Array.isArray(action.value) ? 'round-robin' : 'fixed'
                    }
                });

                this.logger.log(`Success: Lead ${lead.id} assigned to ${assigneeId} via ${workflow.name}`);
            }
        }
    }
}
