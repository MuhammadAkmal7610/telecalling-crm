import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreatePipelineDto, UpdatePipelineDto } from './dto/pipeline.dto';

@Injectable()
export class PipelineService {
    private readonly logger = new Logger(PipelineService.name);
    private readonly TABLE = 'pipelines';

    constructor(private readonly supabaseService: SupabaseService) {}

    async create(dto: CreatePipelineDto, organizationId: string, workspaceId: string) {
        const supabase = this.supabaseService.getAdminClient();

        // Get current max position
        const { data: existing } = await supabase
            .from(this.TABLE)
            .select('position')
            .eq('organization_id', organizationId)
            .eq('workspace_id', workspaceId)
            .order('position', { ascending: false })
            .limit(1)
            .single();

        const position = dto.position ?? ((existing?.position ?? -1) + 1);

        const { data, error } = await supabase
            .from(this.TABLE)
            .insert({ ...dto, organization_id: organizationId, workspace_id: workspaceId, position })
            .select()
            .single();

        if (error) throw new BadRequestException(error.message);
        return data;
    }

    async findAll(organizationId: string, workspaceId: string) {
        if (!workspaceId || workspaceId === 'null' || workspaceId === 'undefined') {
            return [];
        }

        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from(this.TABLE)
            .select('*')
            .eq('organization_id', organizationId)
            .eq('workspace_id', workspaceId)
            .order('position', { ascending: true });

        if (error) throw new BadRequestException(error.message);
        return data || [];
    }

    async findOne(id: string, organizationId: string, workspaceId: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from(this.TABLE)
            .select('*')
            .eq('id', id)
            .eq('organization_id', organizationId)
            .eq('workspace_id', workspaceId)
            .single();

        if (error || !data) throw new NotFoundException(`Pipeline ${id} not found in your workspace`);
        return data;
    }

    async update(id: string, dto: UpdatePipelineDto, organizationId: string, workspaceId: string) {
        const supabase = this.supabaseService.getAdminClient();
        await this.findOne(id, organizationId, workspaceId);

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
        const pipeline = await this.findOne(id, organizationId, workspaceId);

        if (pipeline.is_default) {
            throw new BadRequestException('Cannot delete the default pipeline');
        }

        const { error } = await supabase
            .from(this.TABLE)
            .delete()
            .eq('id', id)
            .eq('organization_id', organizationId)
            .eq('workspace_id', workspaceId);

        if (error) throw new BadRequestException(error.message);
        return { message: 'Pipeline deleted' };
    }

    async reorder(pipelineIds: string[], organizationId: string, workspaceId: string) {
        const supabase = this.supabaseService.getAdminClient();
        const updates = pipelineIds.map((id, idx) =>
            supabase
                .from(this.TABLE)
                .update({ position: idx })
                .eq('id', id)
                .eq('organization_id', organizationId)
                .eq('workspace_id', workspaceId),
        );
        await Promise.all(updates);
        return this.findAll(organizationId, workspaceId);
    }
}
