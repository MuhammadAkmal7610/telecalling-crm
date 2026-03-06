import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { WorkflowsEngineService } from './workflows-engine.service';

@Injectable()
export class WorkflowsService {
    private readonly TABLE = 'workflows';

    constructor(
        private readonly supabaseService: SupabaseService,
        private readonly workflowsEngineService: WorkflowsEngineService
    ) { }

    async findAll(organizationId: string, workspaceId?: string) {
        const supabase = this.supabaseService.getAdminClient();
        let query = supabase
            .from(this.TABLE)
            .select('*')
            .eq('organization_id', organizationId);

        if (workspaceId) {
            query = query.eq('workspace_id', workspaceId);
        }

        const { data, error } = await query;
        if (error) throw new BadRequestException(error.message);
        return data;
    }

    async create(workflowData: any, organizationId: string, workspaceId?: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from(this.TABLE)
            .insert({
                organization_id: organizationId,
                workspace_id: workspaceId,
                name: workflowData.name,
                description: workflowData.description,
                trigger: workflowData.trigger,
                actions: workflowData.actions,
                conditions: workflowData.conditions,
                is_active: workflowData.is_active !== false,
            })
            .select()
            .single();

        if (error) throw new BadRequestException(error.message);
        return data;
    }

    async update(id: string, organizationId: string, workspaceId: string, dto: any) {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from(this.TABLE)
            .update(dto)
            .eq('id', id)
            .eq('organization_id', organizationId)
            .eq('workspace_id', workspaceId)
            .select()
            .single();

        if (error) throw new BadRequestException(error.message);
        return data;
    }

    async remove(id: string, organizationId: string, workspaceId: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { error } = await supabase
            .from(this.TABLE)
            .delete()
            .eq('id', id)
            .eq('organization_id', organizationId)
            .eq('workspace_id', workspaceId);

        if (error) throw new BadRequestException(error.message);
        return { message: 'Workflow deleted' };
    }

    async testWorkflow(workflowData: any) {
        const supabase = this.supabaseService.getAdminClient();
        
        try {
            // Create a test lead for testing
            const testLead = {
                id: 'test-lead-id',
                name: 'Test Lead',
                email: 'test@example.com',
                phone: '+1234567890',
                organization_id: 'test-org-id',
                workspace_id: 'test-workspace-id',
                status: 'new',
                source: 'test'
            };

            // Execute the workflow with the test lead
            const result = await this.workflowsEngineService.processLead(testLead, workflowData.trigger?.type || 'lead_created', {
                test_mode: true,
                workflow_data: workflowData
            });

            return {
                success: true,
                message: 'Workflow test completed successfully',
                result: result,
                test_lead: testLead
            };
        } catch (error) {
            return {
                success: false,
                message: 'Workflow test failed: ' + error.message,
                error: error.message
            };
        }
    }
}
