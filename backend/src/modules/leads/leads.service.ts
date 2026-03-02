import {
    Injectable, Logger, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateLeadDto, UpdateLeadDto, LeadQueryDto, LeadStatus } from './dto/lead.dto';

@Injectable()
export class LeadsService {
    private readonly logger = new Logger(LeadsService.name);
    private readonly TABLE = 'leads';

    constructor(private readonly supabaseService: SupabaseService) { }

    private mapDtoToDb(dto: CreateLeadDto | UpdateLeadDto) {
        const {
            altPhone, alt_phone,
            stageId, stage_id,
            assigneeId, assignee_id,
            lostReason, lost_reason,
            customFields, custom_fields,
            organizationId,
            ...rest
        } = dto as any;

        const dbColumns = [
            'name', 'phone', 'email', 'status', 'source',
            'created_by', 'updated_at', 'campaign_id', 'rating'
        ];

        const mapped: any = {};
        const extraFields: any = { ...(custom_fields || {}), ...(customFields || {}) };

        mapped.alt_phone = (alt_phone || altPhone) || undefined;
        mapped.stage_id = (stage_id || stageId) || undefined;
        mapped.assignee_id = (assignee_id || assigneeId) || undefined;
        mapped.lost_reason = (lost_reason || lostReason) || undefined;

        Object.keys(rest).forEach(key => {
            if (dbColumns.includes(key)) {
                mapped[key] = rest[key];
            } else {
                extraFields[key] = rest[key];
            }
        });

        mapped.custom_fields = extraFields;
        return mapped;
    }

    async create(dto: CreateLeadDto, user: any) {
        const supabase = this.supabaseService.getAdminClient();
        const mappedData = this.mapDtoToDb(dto);
        const { id: userId, organizationId, email, name } = user;

        const { error: userError } = await supabase.from('users').upsert({
            id: userId,
            organization_id: organizationId,
            email: email || 'unknown@example.com',
            name: name || 'User',
            updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

        const insertData = {
            ...mappedData,
            status: mappedData.status ?? LeadStatus.FRESH,
            created_by: userId,
            organization_id: organizationId,
            workspace_id: user.workspaceId,
            assignee_id: mappedData.assignee_id ?? userId,
        };

        const { data, error } = await supabase
            .from(this.TABLE)
            .insert(insertData)
            .select()
            .single();

        if (error) throw new BadRequestException(error.message);
        return data;
    }

    async findAll(query: LeadQueryDto, workspaceId: string) {
        if (!workspaceId) throw new BadRequestException('Workspace ID is required');
        const supabase = this.supabaseService.getAdminClient();
        const { page = 1, limit = 20, search, status, source, assigneeId, stageId, archive } = query;
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        let q = supabase
            .from(this.TABLE)
            .select('*, stage:lead_stages(id,name,color), assignee:users!assignee_id(id,name,email)', { count: 'exact' })
            .eq('workspace_id', workspaceId)
            .order('created_at', { ascending: false })
            .range(from, to);

        if (search) {
            q = q.or(`name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
        }
        if (status) q = q.eq('status', status);
        if (source) q = q.eq('source', source);
        if (assigneeId) q = q.eq('assignee_id', assigneeId);
        if (stageId) q = q.eq('stage_id', stageId);

        if (archive === 'true') {
            q = q.in('status', [LeadStatus.ARCHIVE, LeadStatus.COLD, LeadStatus.TRASH]);
        } else if (!archive) {
            q = q.not('status', 'in', `(${LeadStatus.ARCHIVE},${LeadStatus.COLD},${LeadStatus.TRASH})`);
        }

        const { data, error, count } = await q;
        if (error) throw new BadRequestException(error.message);

        return { data, total: count, page, limit };
    }

    async findOne(id: string, workspaceId: string) {
        if (!workspaceId) throw new BadRequestException('Workspace ID is required');
        const supabase = this.supabaseService.getAdminClient();

        const { data, error } = await supabase
            .from(this.TABLE)
            .select('*, stage:lead_stages(id,name,color,type), assignee:users!assignee_id(id,name,email)')
            .eq('id', id)
            .eq('workspace_id', workspaceId)
            .single();

        if (error || !data) throw new NotFoundException(`Lead ${id} not found`);
        return data;
    }

    async update(id: string, dto: UpdateLeadDto, workspaceId: string) {
        const supabase = this.supabaseService.getAdminClient();
        await this.findOne(id, workspaceId);
        const mappedData = this.mapDtoToDb(dto);

        const { data, error } = await supabase
            .from(this.TABLE)
            .update({ ...mappedData, updated_at: new Date().toISOString() })
            .eq('id', id)
            .eq('workspace_id', workspaceId)
            .select()
            .single();

        if (error) throw new BadRequestException(error.message);
        return data;
    }

    async remove(id: string, workspaceId: string) {
        const supabase = this.supabaseService.getAdminClient();
        await this.findOne(id, workspaceId);
        const { error } = await supabase.from(this.TABLE).delete().eq('id', id).eq('workspace_id', workspaceId);
        if (error) throw new BadRequestException(error.message);
        return { message: 'Lead deleted successfully' };
    }

    async bulkImport(leads: CreateLeadDto[], user: any) {
        const supabase = this.supabaseService.getAdminClient();
        const { id: userId, organizationId } = user;

        const rows = leads.map((l) => {
            const mapped = this.mapDtoToDb(l);
            return {
                ...mapped,
                status: mapped.status ?? LeadStatus.FRESH,
                created_by: userId,
                organization_id: organizationId,
                workspace_id: user.workspaceId,
                assignee_id: mapped.assignee_id ?? userId,
            };
        });

        const { data, error } = await supabase.from(this.TABLE).insert(rows).select();
        if (error) throw new BadRequestException(error.message);
        return { inserted: data?.length || 0, data };
    }

    async bulkAssign(leadIds: string[], assigneeId: string, workspaceId: string) {
        if (!workspaceId) throw new BadRequestException('Workspace ID is required');
        const supabase = this.supabaseService.getAdminClient();

        const { data, error } = await supabase
            .from(this.TABLE)
            .update({ assignee_id: assigneeId, updated_at: new Date().toISOString() })
            .in('id', leadIds)
            .eq('workspace_id', workspaceId)
            .select();

        if (error) throw new BadRequestException(error.message);
        return { count: data?.length || 0, data };
    }

    async assignLead(leadId: string, assigneeId: string, workspaceId: string) {
        return this.update(leadId, { assigneeId } as UpdateLeadDto, workspaceId);
    }

    async updateStatus(leadId: string, status: LeadStatus, workspaceId: string, lostReason?: string) {
        return this.update(leadId, { status, lostReason } as UpdateLeadDto, workspaceId);
    }

    async getStats(workspaceId: string) {
        if (!workspaceId) throw new BadRequestException('Workspace ID is required');
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from(this.TABLE)
            .select('status')
            .eq('workspace_id', workspaceId);

        if (error) throw new BadRequestException(error.message);

        const stats = (data as { status: string }[]).reduce((acc: Record<string, number>, lead) => {
            acc[lead.status] = (acc[lead.status] || 0) + 1;
            return acc;
        }, {});

        return stats;
    }

    async getDuplicates(workspaceId: string, type: 'phone' | 'email' = 'phone') {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from(this.TABLE)
            .select('id, name, phone, email, status, assignee_id, assignee:users!assignee_id(id,name)')
            .eq('workspace_id', workspaceId);

        if (error) throw new BadRequestException(error.message);

        const groups = (data as any[]).reduce((acc: Record<string, any[]>, lead) => {
            const key = type === 'phone' ? lead.phone : lead.email;
            if (key) {
                if (!acc[key]) acc[key] = [];
                acc[key].push(lead);
            }
            return acc;
        }, {});

        const duplicates = Object.entries(groups)
            .filter(([_, group]: [string, any[]]) => group.length > 1)
            .map(([key, group]) => ({ key, leads: group }));

        return duplicates;
    }
}
