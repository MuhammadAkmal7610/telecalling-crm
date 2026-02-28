import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateCallFeedbackStatusDto, UpdateCallFeedbackStatusDto } from './dto/call-feedback.dto';

@Injectable()
export class CallsService {
    private readonly logger = new Logger(CallsService.name);
    private readonly TABLE = 'call_feedback_statuses';

    constructor(private readonly supabaseService: SupabaseService) { }

    async getStatuses() {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from(this.TABLE)
            .select('*')
            .order('position', { ascending: true });

        if (error) throw new BadRequestException(error.message);
        return data;
    }

    async createStatus(dto: CreateCallFeedbackStatusDto) {
        const supabase = this.supabaseService.getAdminClient();

        // ---added by akmal--if setting as default, unset others
        if (dto.isDefault) {
            await supabase.from(this.TABLE).update({ is_default: false }).neq('id', '0');
        }

        const { data, error } = await supabase
            .from(this.TABLE)
            .insert(dto)
            .select()
            .single();

        if (error) throw new BadRequestException(error.message);
        return data;
    }

    async updateStatus(id: string, dto: UpdateCallFeedbackStatusDto) {
        const supabase = this.supabaseService.getAdminClient();

        if (dto.isDefault) {
            await supabase.from(this.TABLE).update({ is_default: false }).neq('id', id);
        }

        const { data, error } = await supabase
            .from(this.TABLE)
            .update(dto)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new BadRequestException(error.message);
        return data;
    }

    async removeStatus(id: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { error } = await supabase.from(this.TABLE).delete().eq('id', id);
        if (error) throw new BadRequestException(error.message);
        return { message: 'Call status deleted' };
    }

    async reorderStatuses(statusIds: string[]) {
        const supabase = this.supabaseService.getAdminClient();
        await Promise.all(
            statusIds.map((id, idx) =>
                supabase.from(this.TABLE).update({ position: idx }).eq('id', id),
            ),
        );
        return this.getStatuses();
    }
}
