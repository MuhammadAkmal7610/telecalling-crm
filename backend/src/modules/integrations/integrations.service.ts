import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class IntegrationsService {
    private readonly TABLE = 'integrations';

    constructor(private readonly supabaseService: SupabaseService) { }

    async findAll(organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from(this.TABLE)
            .select('*')
            .eq('organization_id', organizationId);

        if (error) throw new BadRequestException(error.message);
        return data;
    }

    async seedDefaults(organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();
        const defaults = [
            { name: 'Facebook', type: 'facebook', status: 'active', config: { logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg' } },
            { name: 'Website/API', type: 'website', status: 'active', config: { logo: 'https://cdn-icons-png.flaticon.com/512/1006/1006771.png' } },
            { name: 'Whatsapp', type: 'whatsapp', status: 'active', config: { logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg' } },
        ];

        const rows = defaults.map(d => ({ ...d, organization_id: organizationId }));
        const { data, error } = await supabase.from(this.TABLE).upsert(rows, { onConflict: 'organization_id,name' }).select();

        if (error) return [];
        return data;
    }
}
