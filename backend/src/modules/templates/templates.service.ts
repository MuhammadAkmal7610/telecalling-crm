import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class TemplatesService {
    private readonly TABLE = 'permission_templates';

    constructor(private readonly supabaseService: SupabaseService) { }

    async findAll(organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from(this.TABLE)
            .select('*')
            .eq('organization_id', organizationId)
            .order('name', { ascending: true });

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
}
