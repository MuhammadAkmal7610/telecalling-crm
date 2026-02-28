import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateScriptDto, UpdateScriptDto } from './dto/script.dto';

@Injectable()
export class ScriptsService {
    private readonly logger = new Logger(ScriptsService.name);
    private readonly TABLE = 'scripts';

    constructor(private readonly supabaseService: SupabaseService) { }

    async create(dto: CreateScriptDto, organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();

        const { data, error } = await supabase
            .from(this.TABLE)
            .insert({
                ...dto,
                organization_id: organizationId
            })
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
            .order('updated_at', { ascending: false });

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

        if (error || !data) throw new NotFoundException(`Script ${id} not found.`);
        return data;
    }

    async update(id: string, dto: UpdateScriptDto, organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();
        await this.findOne(id, organizationId);

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
        await this.findOne(id, organizationId);
        const { error } = await supabase.from(this.TABLE).delete().eq('id', id).eq('organization_id', organizationId);
        if (error) throw new BadRequestException(error.message);
        return { message: 'Script deleted' };
    }
}
