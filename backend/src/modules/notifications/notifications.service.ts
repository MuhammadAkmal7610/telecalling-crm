import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
    private readonly TABLE = 'notifications';

    constructor(
        private readonly supabaseService: SupabaseService,
        private readonly notificationsGateway: NotificationsGateway
    ) { }

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

    async create(userId: string, organizationId: string, title: string, message: string, type: string = 'info', sendRealTime: boolean = true) {
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
        
        // Send real-time notification if enabled
        if (sendRealTime) {
            this.notificationsGateway.sendNotificationToUser(userId, data);
        }
        
        return data;
    }

    // Real-time notification triggers for key events
    async triggerLeadNotification(organizationId: string, userId: string, leadName: string, action: 'created' | 'assigned' | 'updated') {
        const title = action === 'created' ? 'New Lead Created' : 
                     action === 'assigned' ? 'Lead Assigned' : 'Lead Updated';
        const message = `Lead "${leadName}" has been ${action}`;
        
        return this.create(userId, organizationId, title, message, 'lead');
    }

    async triggerCallNotification(organizationId: string, userId: string, leadName: string, callType: 'missed' | 'completed' | 'scheduled') {
        const title = callType === 'missed' ? 'Missed Call' : 
                     callType === 'completed' ? 'Call Completed' : 'Call Scheduled';
        const message = `${title} for lead "${leadName}"`;
        
        return this.create(userId, organizationId, title, message, 'call');
    }

    async triggerTaskNotification(organizationId: string, userId: string, taskTitle: string, action: 'due' | 'assigned' | 'completed') {
        const title = action === 'due' ? 'Task Due Soon' : 
                     action === 'assigned' ? 'Task Assigned' : 'Task Completed';
        const message = `Task "${taskTitle}" ${action === 'due' ? 'is due soon' : `has been ${action}`}`;
        
        return this.create(userId, organizationId, title, message, 'task');
    }

    async triggerSystemNotification(organizationId: string, userId: string, message: string, type: 'info' | 'warning' | 'error' = 'info') {
        return this.create(userId, organizationId, 'System Notification', message, type);
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
