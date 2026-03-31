import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateApiTemplateDto, UpdateApiTemplateDto } from './dto/api-template.dto';

@Injectable()
export class ApiTemplatesService {
    private readonly TABLE = 'api_templates';

    constructor(private readonly supabaseService: SupabaseService) { }

    async findAll(organizationId: string, workspaceId: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from(this.TABLE)
            .select(`
                *,
                workflow:workflows(id, name),
                creator:users!api_templates_created_by_fkey(id, name, email)
            `)
            .eq('organization_id', organizationId)
            .eq('workspace_id', workspaceId)
            .order('name', { ascending: true });

        if (error) throw new BadRequestException(error.message);
        return data || [];
    }

    async findOne(id: string, organizationId: string, workspaceId: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from(this.TABLE)
            .select(`
                *,
                workflow:workflows(id, name),
                creator:users!api_templates_created_by_fkey(id, name, email)
            `)
            .eq('id', id)
            .eq('organization_id', organizationId)
            .eq('workspace_id', workspaceId)
            .single();

        if (error || !data) throw new NotFoundException('Template not found');
        return data;
    }

    async create(dto: CreateApiTemplateDto, organizationId: string, workspaceId: string, userId: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from(this.TABLE)
            .insert({
                ...dto,
                organization_id: organizationId,
                workspace_id: workspaceId,
                created_by: userId,
                // Ensure variables/headers are JSONB compatible
                variables: Array.isArray(dto.variables) ? dto.variables : [],
                headers: dto.headers || {}
            })
            .select()
            .single();

        if (error) throw new BadRequestException(error.message);
        return data;
    }

    async update(id: string, dto: UpdateApiTemplateDto, organizationId: string, workspaceId: string) {
        // Enforce ownership
        await this.findOne(id, organizationId, workspaceId);

        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from(this.TABLE)
            .update({
                ...dto,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw new BadRequestException(error.message);
        return data;
    }

    async remove(id: string, organizationId: string, workspaceId: string) {
        await this.findOne(id, organizationId, workspaceId);

        const supabase = this.supabaseService.getAdminClient();
        const { error } = await supabase
            .from(this.TABLE)
            .delete()
            .eq('id', id);

        if (error) throw new BadRequestException(error.message);
        return { success: true };
    }
}
