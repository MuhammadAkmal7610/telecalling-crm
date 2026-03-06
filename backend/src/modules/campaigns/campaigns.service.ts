import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateCampaignDto, UpdateCampaignDto, CampaignQueryDto } from './dto/campaign.dto';

@Injectable()
export class CampaignsService {
    private readonly logger = new Logger(CampaignsService.name);
    private readonly TABLE = 'campaigns';

    constructor(private readonly supabaseService: SupabaseService) { }

    private validateUUIDs(ids: string[]): string[] {
        return ids.filter(id => {
            if (!id || id === 'null' || id === 'undefined' || id === '') {
                return false;
            }
            // Simple UUID validation - can be enhanced later
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(id)) {
                throw new BadRequestException(`Invalid UUID format: ${id}`);
            }
            return true;
        });
    }

    async create(dto: CreateCampaignDto, userId: string, workspaceId: string, organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();

        // Require workspaceId for campaigns
        if (!workspaceId) {
            throw new BadRequestException('Workspace ID is required to create campaigns');
        }

        // Map camelCase to snake_case for the database
        const { assigneeIds, ...rest } = dto;
        
        // Validate and filter UUIDs
        const validAssigneeIds = assigneeIds ? this.validateUUIDs(assigneeIds) : [];
        
        const campaignData = {
            ...rest,
            assignee_ids: validAssigneeIds,
            created_by: userId,
            workspace_id: workspaceId,
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

    async findAll(query: CampaignQueryDto, workspaceId: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { page = 1, limit = 20, search, status, priority } = query;
        const from = (page - 1) * limit;

        // Require workspaceId for campaigns
        if (!workspaceId) {
            throw new BadRequestException('Workspace ID is required to list campaigns');
        }

        let q = supabase
            .from(this.TABLE)
            .select('*, creator:users!created_by(id,name)', { count: 'exact' })
            .eq('workspace_id', workspaceId)
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

    async findOne(id: string, workspaceId: string) {
        const supabase = this.supabaseService.getAdminClient();
        
        // Require workspaceId for campaigns
        if (!workspaceId) {
            throw new BadRequestException('Workspace ID is required to access campaigns');
        }
        
        let q = supabase
            .from(this.TABLE)
            .select('*, creator:users!created_by(id,name)')
            .eq('id', id)
            .eq('workspace_id', workspaceId);

        const { data, error } = await q.single();

        if (error || !data) throw new NotFoundException(`Campaign ${id} not found in this workspace`);
        return data;
    }

    async update(id: string, dto: UpdateCampaignDto, workspaceId: string) {
        const supabase = this.supabaseService.getAdminClient();
        
        // Require workspaceId for campaigns
        if (!workspaceId) {
            throw new BadRequestException('Workspace ID is required to update campaigns');
        }
        
        await this.findOne(id, workspaceId);

        const { assigneeIds, ...rest } = dto;
        
        // Validate and filter UUIDs if provided
        const validAssigneeIds = assigneeIds ? this.validateUUIDs(assigneeIds) : undefined;
        
        const updateData = {
            ...rest,
            ...(validAssigneeIds && { assignee_ids: validAssigneeIds }),
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from(this.TABLE)
            .update(updateData)
            .eq('id', id)
            .eq('workspace_id', workspaceId)
            .select()
            .single();

        if (error) throw new BadRequestException(error.message);
        return data;
    }

    async remove(id: string, workspaceId: string) {
        const supabase = this.supabaseService.getAdminClient();
        
        // Require workspaceId for campaigns
        if (!workspaceId) {
            throw new BadRequestException('Workspace ID is required to delete campaigns');
        }
        
        await this.findOne(id, workspaceId);
        const { error } = await supabase
            .from(this.TABLE)
            .delete()
            .eq('id', id)
            .eq('workspace_id', workspaceId);
        if (error) throw new BadRequestException(error.message);
        return { message: 'Campaign deleted' };
    }

    async getStats(id: string, workspaceId: string) {
        const supabase = this.supabaseService.getAdminClient();
        
        // Require workspaceId for campaigns
        if (!workspaceId) {
            throw new BadRequestException('Workspace ID is required to access campaign stats');
        }
        
        await this.findOne(id, workspaceId);
        // ---added by akmal--Get campaign lead progress stats
        const { data, error } = await supabase
            .from('leads')
            .select('status', { count: 'exact' })
            .eq('campaign_id', id)
            .eq('workspace_id', workspaceId);

        if (error) throw new BadRequestException(error.message);

        const stats = data.reduce((acc: Record<string, number>, l) => {
            acc[l.status] = (acc[l.status] || 0) + 1;
            return acc;
        }, {});

        return { campaignId: id, stats, total: data.length };
    }
}
