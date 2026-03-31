import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class ListsService {
    private readonly logger = new Logger(ListsService.name);
    private readonly TABLE = 'lead_lists';
    private readonly JUNCTION_TABLE = 'list_leads';

    constructor(private readonly supabaseService: SupabaseService) { }

    async findAll(user: any) {
        const workspaceId = user.workspaceId;
        const supabase = this.supabaseService.getAdminClient();

        const { data, error } = await supabase
            .from(this.TABLE)
            .select(`
                *,
                leads:list_leads(count)
            `)
            .eq('workspace_id', workspaceId)
            .order('created_at', { ascending: false });

        if (error) throw new BadRequestException(error.message);

        // Map lead counts from the junction table relation
        return data?.map(list => ({
            ...list,
            count: list.leads?.[0]?.count || 0
        })) || [];
    }

    async findOne(id: string, workspaceId: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from(this.TABLE)
            .select('*')
            .eq('id', id)
            .eq('workspace_id', workspaceId)
            .single();

        if (error || !data) throw new BadRequestException('List not found');
        return data;
    }

    async create(dto: any, user: any) {
        const workspaceId = user.workspaceId;
        const organizationId = user.organizationId;
        const supabase = this.supabaseService.getAdminClient();

        const { data, error } = await supabase
            .from(this.TABLE)
            .insert({
                ...dto,
                workspace_id: workspaceId,
                organization_id: organizationId,
                created_by: user.id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw new BadRequestException(error.message);
        return data;
    }

    async remove(id: string, workspaceId: string) {
        await this.findOne(id, workspaceId);
        const supabase = this.supabaseService.getAdminClient();

        const { error } = await supabase
            .from(this.TABLE)
            .delete()
            .eq('id', id)
            .eq('workspace_id', workspaceId);

        if (error) throw new BadRequestException(error.message);
        return { message: 'List deleted successfully' };
    }

    async addLeadsToList(listId: string, leadIds: string[], workspaceId: string) {
        await this.findOne(listId, workspaceId);
        const supabase = this.supabaseService.getAdminClient();

        const inserts = leadIds.map(leadId => ({
            list_id: listId,
            lead_id: leadId
        }));

        const { error } = await supabase
            .from(this.JUNCTION_TABLE)
            .upsert(inserts, { onConflict: 'list_id,lead_id' });

        if (error) throw new BadRequestException(error.message);
        return { message: 'Leads added to list' };
    }
}
