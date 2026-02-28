import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class WorkspacesService {
    private readonly logger = new Logger(WorkspacesService.name);
    private readonly TABLE = 'organizations';

    constructor(private readonly supabaseService: SupabaseService) { }

    async create(name: string) {
        const supabase = this.supabaseService.getAdminClient();

        const { data, error } = await supabase
            .from('organizations')
            .insert({ name })
            .select()
            .single();

        if (error) {
            this.logger.error(`Create organization error: ${error.message}`);
            throw new BadRequestException(error.message);
        }

        return data;
    }

    async createWorkspace(dto: any, organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();

        const { data, error } = await supabase
            .from('workspaces')
            .insert({
                ...dto,
                organization_id: organizationId
            })
            .select()
            .single();

        if (error) {
            this.logger.error(`Create workspace error: ${error.message}`);
            throw new BadRequestException(error.message);
        }

        return data;
    }

    async findAllInOrg(organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from('workspaces')
            .select('*')
            .eq('organization_id', organizationId);

        if (error) throw new BadRequestException(error.message);
        return data;
    }

    async findByName(name: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from('organizations')
            .select('*')
            .eq('name', name)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw new BadRequestException(error.message);
        }
        return data;
    }

    async findById(id: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw new BadRequestException(error.message);
        return data;
    }
}
