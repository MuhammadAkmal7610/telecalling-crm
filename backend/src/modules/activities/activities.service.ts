import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateActivityDto, ActivityQueryDto } from './dto/activity.dto';

@Injectable()
export class ActivitiesService {
    private readonly logger = new Logger(ActivitiesService.name);
    private readonly TABLE = 'activities';

    constructor(private readonly supabaseService: SupabaseService) { }

    async create(dto: CreateActivityDto, userId: string, workspaceId: string, organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();

        const { data, error } = await supabase
            .from(this.TABLE)
            .insert({
                ...dto,
                user_id: userId,
                workspace_id: workspaceId,
                organization_id: organizationId
            })
            .select()
            .single();

        if (error) throw new BadRequestException(error.message);
        return data;
    }

    async findAll(query: ActivityQueryDto, workspaceId: string, organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { page = 1, limit = 20, type, leadId, userId, period } = query;
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        let q = supabase
            .from(this.TABLE)
            .select('*, user:users(id,name), lead:leads(id,name,phone)', { count: 'exact' })
            .eq('workspace_id', workspaceId)
            .eq('organization_id', organizationId)
            .order('created_at', { ascending: false })
            .range(from, to);

        if (type) q = q.eq('type', type);
        if (leadId) q = q.eq('lead_id', leadId);
        if (userId) q = q.eq('user_id', userId);

        // ---added by akmal--Period filter
        if (period) {
            const now = new Date();
            if (period === 'today') {
                const start = new Date(now); start.setHours(0, 0, 0, 0);
                q = q.gte('created_at', start.toISOString());
            } else if (period === 'yesterday') {
                const start = new Date(now); start.setDate(start.getDate() - 1); start.setHours(0, 0, 0, 0);
                const end = new Date(start); end.setHours(23, 59, 59, 999);
                q = q.gte('created_at', start.toISOString()).lte('created_at', end.toISOString());
            } else if (period === 'this_week') {
                const start = new Date(now); start.setDate(start.getDate() - start.getDay()); start.setHours(0, 0, 0, 0);
                q = q.gte('created_at', start.toISOString());
            }
        }

        const { data, error, count } = await q;
        if (error) throw new BadRequestException(error.message);

        return { data, total: count, page, limit };
    }

    async findByLead(leadId: string, workspaceId: string, organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from(this.TABLE)
            .select('*, user:users(id,name)')
            .eq('lead_id', leadId)
            .eq('workspace_id', workspaceId)
            .eq('organization_id', organizationId)
            .order('created_at', { ascending: false });

        if (error) throw new BadRequestException(error.message);
        return data;
    }

    async remove(id: string, workspaceId: string, organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { error } = await supabase
            .from(this.TABLE)
            .delete()
            .eq('id', id)
            .eq('workspace_id', workspaceId)
            .eq('organization_id', organizationId);
        if (error) throw new BadRequestException(error.message);
        return { message: 'Activity deleted' };
    }
}
