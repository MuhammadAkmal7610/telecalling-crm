import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class WorkflowsService {
    private readonly TABLE = 'workflows';

    constructor(private readonly supabaseService: SupabaseService) { }

    async findAll(organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from(this.TABLE)
            .select('*')
            .eq('organization_id', organizationId);

        if (error) throw new BadRequestException(error.message);
        return data;
    }

    async create(organizationId: string, name: string, trigger: any, action: any) {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from(this.TABLE)
            .insert({
                organization_id: organizationId,
                name,
                trigger, // ---added by akmal--e.g., { type: 'lead_source', value: 'Facebook' }
                action,  // ---added by akmal--e.g., { type: 'assign_to', value: 'user-uuid' }
                is_active: true,
            })
            .select()
            .single();

        if (error) throw new BadRequestException(error.message);
        return data;
    }

    async update(id: string, organizationId: string, dto: any) {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from(this.TABLE)
            .update(dto)
            .eq('id', id)
            .eq('organization_id', organizationId)
            .select()
            .single();

        if (error) throw new BadRequestException(error.message);
        return data;
    }

    async remove(id: string, organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { error } = await supabase
            .from(this.TABLE)
            .delete()
            .eq('id', id)
            .eq('organization_id', organizationId);

        if (error) throw new BadRequestException(error.message);
        return { message: 'Workflow deleted' };
    }
}
