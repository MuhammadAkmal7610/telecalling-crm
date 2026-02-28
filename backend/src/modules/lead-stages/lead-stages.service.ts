import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import {
    CreateLeadStageDto, UpdateLeadStageDto,
    CreateLostReasonDto, UpdateLostReasonDto,
} from './dto/lead-stage.dto';

@Injectable()
export class LeadStagesService {
    private readonly logger = new Logger(LeadStagesService.name);
    private readonly TABLE = 'lead_stages';
    private readonly LOST_REASONS_TABLE = 'lost_reasons';

    constructor(private readonly supabaseService: SupabaseService) { }

    // ---added by akmal--─── Stages ───────────────────────────────────────────────────────────────

    async create(dto: CreateLeadStageDto, organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();

        // ---added by akmal--Get current max position for this organization
        const { data: existing } = await supabase
            .from(this.TABLE)
            .select('position')
            .eq('organization_id', organizationId)
            .order('position', { ascending: false })
            .limit(1)
            .single();

        const position = dto.position ?? ((existing?.position ?? 0) + 1);

        const { data, error } = await supabase
            .from(this.TABLE)
            .insert({ ...dto, organization_id: organizationId, position })
            .select()
            .single();

        if (error) throw new BadRequestException(error.message);
        return data;
    }

    async findAll(organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from(this.TABLE)
            .select('*')
            .eq('organization_id', organizationId)
            .order('position', { ascending: true });

        if (error) throw new BadRequestException(error.message);
        return data;
    }

    async findOne(id: string, organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from(this.TABLE)
            .select('*')
            .eq('id', id)
            .eq('organization_id', organizationId)
            .single();

        if (error || !data) throw new NotFoundException(`Stage ${id} not found in your organization`);
        return data;
    }

    async update(id: string, dto: UpdateLeadStageDto, organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();
        await this.findOne(id, organizationId);

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
        const stage = await this.findOne(id, organizationId);

        if (stage.is_default) {
            throw new BadRequestException('Cannot delete the default stage');
        }

        const { error } = await supabase.from(this.TABLE).delete().eq('id', id).eq('organization_id', organizationId);
        if (error) throw new BadRequestException(error.message);
        return { message: 'Stage deleted' };
    }

    async reorder(stageIds: string[], organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();
        const updates = stageIds.map((id, idx) =>
            supabase.from(this.TABLE).update({ position: idx }).eq('id', id).eq('organization_id', organizationId),
        );
        await Promise.all(updates);
        return this.findAll(organizationId);
    }

    // ---added by akmal--─── Lost Reasons ─────────────────────────────────────────────────────────

    async getLostReasons(organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from(this.LOST_REASONS_TABLE)
            .select('*')
            .eq('organization_id', organizationId)
            .order('position', { ascending: true });

        if (error) throw new BadRequestException(error.message);
        return data;
    }

    async createLostReason(dto: CreateLostReasonDto, organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { data: existing } = await supabase
            .from(this.LOST_REASONS_TABLE)
            .select('position')
            .eq('organization_id', organizationId)
            .order('position', { ascending: false })
            .limit(1)
            .single();

        const position = dto.position ?? ((existing?.position ?? 0) + 1);
        const { data, error } = await supabase
            .from(this.LOST_REASONS_TABLE)
            .insert({ ...dto, organization_id: organizationId, position })
            .select()
            .single();

        if (error) throw new BadRequestException(error.message);
        return data;
    }

    async updateLostReason(id: string, dto: UpdateLostReasonDto, organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from(this.LOST_REASONS_TABLE)
            .update(dto)
            .eq('id', id)
            .eq('organization_id', organizationId)
            .select()
            .single();

        if (error) throw new BadRequestException(error.message);
        return data;
    }

    async removeLostReason(id: string, organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { error } = await supabase
            .from(this.LOST_REASONS_TABLE)
            .delete()
            .eq('id', id)
            .eq('organization_id', organizationId);
        if (error) throw new BadRequestException(error.message);
        return { message: 'Lost reason deleted' };
    }
}
