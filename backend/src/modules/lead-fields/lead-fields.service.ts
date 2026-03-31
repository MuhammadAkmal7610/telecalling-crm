import { Injectable, BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class LeadFieldsService {
    private readonly logger = new Logger(LeadFieldsService.name);
    private readonly TABLE = 'lead_field_definitions';

    constructor(private readonly supabaseService: SupabaseService) { }

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

    async create(dto: any, organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from(this.TABLE)
            .insert({ ...dto, organization_id: organizationId })
            .select()
            .single();

        if (error) throw new BadRequestException(error.message);
        return data;
    }

    async update(id: string, dto: any, organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from(this.TABLE)
            .update({ ...dto, updated_at: new Date().toISOString() })
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
        return { message: 'Field deleted successfully' };
    }

    async seedDefaults(organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();
        const defaults = [
            { name: 'name', label: 'Name', type: 'text', is_default: true, position: 1 },
            { name: 'phone', label: 'Phone', type: 'tel', is_default: true, position: 2 },
            { name: 'email', label: 'Email', type: 'email', is_default: true, position: 3 },
            { name: 'source', label: 'Source', type: 'text', is_default: true, position: 4 },
            { name: 'alt_phone', label: 'Alt Phone', type: 'tel', is_default: true, position: 5 },
            { name: 'company', label: 'Company', type: 'text', is_default: true, position: 6 },
        ];

        const rows = defaults.map(d => ({ ...d, organization_id: organizationId }));
        const { data, error } = await supabase.from(this.TABLE).upsert(rows, { onConflict: 'organization_id,name' }).select();

        if (error) {
            this.logger.error(`Seed defaults failed: ${error.message}`);
            return [];
        }
        return data;
    }
}
