import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class NotificationsService {
    private readonly TABLE = 'notifications';

    constructor(private readonly supabaseService: SupabaseService) { }

    async findAll(userId: string, organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from(this.TABLE)
            .select('*')
            .eq('user_id', userId)
            .eq('organization_id', organizationId)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw new BadRequestException(error.message);
        return data;
    }

    async markAsRead(id: string, userId: string, organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from(this.TABLE)
            .update({ read: true })
            .eq('id', id)
            .eq('user_id', userId)
            .eq('organization_id', organizationId)
            .select()
            .single();

        if (error) throw new BadRequestException(error.message);
        return data;
    }

    async create(userId: string, organizationId: string, title: string, message: string, type: string = 'info') {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from(this.TABLE)
            .insert({
                user_id: userId,
                organization_id: organizationId,
                title,
                message,
                type,
                read: false,
            })
            .select()
            .single();

        if (error) throw new BadRequestException(error.message);
        return data;
    }

    async markAllRead(userId: string, organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { error } = await supabase
            .from(this.TABLE)
            .update({ read: true })
            .eq('user_id', userId)
            .eq('organization_id', organizationId);

        if (error) throw new BadRequestException(error.message);
        return { message: 'All notifications marked as read' };
    }
}
