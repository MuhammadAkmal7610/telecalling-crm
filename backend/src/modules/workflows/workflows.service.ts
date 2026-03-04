import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class WorkflowsService {
    private readonly TABLE = 'workflows';

    constructor(private readonly supabaseService: SupabaseService) { }

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

    async create(organizationId: string, workspaceId: string, name: string, trigger: any, action: any) {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from(this.TABLE)
            .insert({
                organization_id: organizationId,
                workspace_id: workspaceId,
                name,
                trigger,
                action,
                is_active: true,
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
}
