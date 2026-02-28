import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateCampaignDto, UpdateCampaignDto, CampaignQueryDto } from './dto/campaign.dto';

@Injectable()
export class CampaignsService {
    private readonly logger = new Logger(CampaignsService.name);
    private readonly TABLE = 'campaigns';

    constructor(private readonly supabaseService: SupabaseService) { }

    async create(dto: CreateCampaignDto, userId: string, organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();

        // Map camelCase to snake_case for the database
        const { assigneeIds, ...rest } = dto;
        const campaignData = {
            ...rest,
            assignee_ids: assigneeIds || [],
            created_by: userId,
            organization_id: organizationId,
            progress: 0
        };

        const { data, error } = await supabase
            .from(this.TABLE)
            .insert(campaignData)
            .select()
            .single();

        if (error) throw new BadRequestException(error.message);
        return data;
    }

    async findAll(query: CampaignQueryDto, organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { page = 1, limit = 20, search, status, priority } = query;
        const from = (page - 1) * limit;

        let q = supabase
            .from(this.TABLE)
            .select('*, creator:users!created_by(id,name)', { count: 'exact' })
            .eq('organization_id', organizationId)
            .order('created_at', { ascending: false })
            .range(from, from + limit - 1);

        if (search) q = q.ilike('name', `%${search}%`);
        if (status) q = q.eq('status', status);
        if (priority) q = q.eq('priority', priority);

        const { data, error, count } = await q;
        if (error) throw new BadRequestException(error.message);

        // Fetch lead counts for each campaign
        const campaignsWithStats = await Promise.all((data as any[]).map(async (c) => {
            const { count: leadCount, data: leadData } = await supabase
                .from('leads')
                .select('status', { count: 'exact' })
                .eq('campaign_id', c.id);

            const wonCount = leadData?.filter(l => l.status === 'won').length || 0;
            const progress = leadCount ? Math.round((wonCount / leadCount) * 100) : 0;

            return {
                ...c,
                totalLeads: leadCount || 0,
                progress
            };
        }));

        return { data: campaignsWithStats, total: count, page, limit };
    }

    async findOne(id: string, organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from(this.TABLE)
            .select('*, creator:users!created_by(id,name)')
            .eq('id', id)
            .eq('organization_id', organizationId)
            .single();

        if (error || !data) throw new NotFoundException(`Campaign ${id} not found in your organization`);
        return data;
    }

    async update(id: string, dto: UpdateCampaignDto, organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();
        await this.findOne(id, organizationId);

        const { assigneeIds, ...rest } = dto;
        const updateData = {
            ...rest,
            ...(assigneeIds && { assignee_ids: assigneeIds }),
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from(this.TABLE)
            .update(updateData)
            .eq('id', id)
            .eq('organization_id', organizationId)
            .select()
            .single();

        if (error) throw new BadRequestException(error.message);
        return data;
    }

    async remove(id: string, organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();
        await this.findOne(id, organizationId);
        const { error } = await supabase.from(this.TABLE).delete().eq('id', id).eq('organization_id', organizationId);
        if (error) throw new BadRequestException(error.message);
        return { message: 'Campaign deleted' };
    }

    async getStats(id: string, organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();
        await this.findOne(id, organizationId);
        // ---added by akmal--Get campaign lead progress stats
        const { data, error } = await supabase
            .from('leads')
            .select('status', { count: 'exact' })
            .eq('campaign_id', id)
            .eq('organization_id', organizationId);

        if (error) throw new BadRequestException(error.message);

        const stats = data.reduce((acc: Record<string, number>, l) => {
            acc[l.status] = (acc[l.status] || 0) + 1;
            return acc;
        }, {});

        return { campaignId: id, stats, total: data.length };
    }
}
