import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateTaskDto, UpdateTaskDto, TaskQueryDto } from './dto/task.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class TasksService {
    private readonly logger = new Logger(TasksService.name);
    private readonly TABLE = 'tasks';

    constructor(
        private readonly supabaseService: SupabaseService,
        private readonly notificationsService: NotificationsService
    ) { }

    async create(dto: CreateTaskDto, userId: string, workspaceId: string, organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();

        const taskData = {
            description: dto.description,
            type: dto.type || 'Todo',
            status: dto.status || 'Pending',
            priority: dto.priority || 'Medium',
            due_date: dto.dueDate || null,
            lead_id: dto.leadId && dto.leadId !== "" ? dto.leadId : null,
            assignee_id: (dto.assigneeId && dto.assigneeId !== "") ? dto.assigneeId : userId,
            created_by: userId,
            workspace_id: workspaceId,
            organization_id: organizationId,
        };

        const { data, error } = await supabase
            .from(this.TABLE)
            .insert(taskData)
            .select()
            .single();

        if (error) throw new BadRequestException(error.message);

        // ---added by akmal--Emit Notification for Assigned Tasks
        const finalAssigneeId = taskData.assignee_id;
        if (finalAssigneeId !== userId) {
            await this.notificationsService.create(
                finalAssigneeId,
                organizationId,
                'New Task Assigned',
                `A new ${dto.type === 'CallFollowup' ? 'call followup' : 'task'} "${dto.description}" has been assigned to you.`,
                'info'
            );
        } else if (dto.type === 'CallFollowup') {
            await this.notificationsService.create(
                finalAssigneeId,
                organizationId,
                'Followup Scheduled',
                `You scheduled a followup: "${dto.description}".`,
                'info'
            );
        }

        return data;
    }

    async findAll(query: TaskQueryDto, workspaceId: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { page = 1, limit = 20, type, status, priority, assigneeId, leadId, due } = query;
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        let q = supabase
            .from(this.TABLE)
            .select('*, lead:leads(id,name,phone), assignee:users!assignee_id(id,name)', { count: 'exact' })
            .eq('workspace_id', workspaceId)
            .order('due_date', { ascending: true })
            .range(from, to);

        if (type) q = q.eq('type', type);
        if (status) q = q.eq('status', status);
        if (priority) q = q.eq('priority', priority);
        if (assigneeId) q = q.eq('assignee_id', assigneeId);
        if (leadId) q = q.eq('lead_id', leadId);

        // ---added by akmal--Due date shorthand filter
        if (due) {
            const now = new Date();
            if (due === 'today') {
                const start = new Date(now.setHours(0, 0, 0, 0)).toISOString();
                const end = new Date(now.setHours(23, 59, 59, 999)).toISOString();
                q = q.gte('due_date', start).lte('due_date', end);
            } else if (due === 'yesterday') {
                const d = new Date(); d.setDate(d.getDate() - 1);
                const start = new Date(d.setHours(0, 0, 0, 0)).toISOString();
                const end = new Date(d.setHours(23, 59, 59, 999)).toISOString();
                q = q.gte('due_date', start).lte('due_date', end);
            }
        }

        const { data, error, count } = await q;
        if (error) throw new BadRequestException(error.message);

        return { data, total: count, page, limit };
    }

    async findOne(id: string, workspaceId: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from(this.TABLE)
            .select('*, lead:leads(id,name,phone), assignee:users!assignee_id(id,name,email), creator:users!created_by(id,name)')
            .eq('id', id)
            .eq('workspace_id', workspaceId)
            .single();

        if (error || !data) throw new NotFoundException(`Task ${id} not found in this workspace`);
        return data;
    }

    async update(id: string, dto: UpdateTaskDto, workspaceId: string) {
        const supabase = this.supabaseService.getAdminClient();
        await this.findOne(id, workspaceId);

        const updateData: any = {
            updated_at: new Date().toISOString()
        };

        if (dto.description !== undefined) updateData.description = dto.description;
        if (dto.type !== undefined) updateData.type = dto.type;
        if (dto.status !== undefined) updateData.status = dto.status;
        if (dto.priority !== undefined) updateData.priority = dto.priority;
        if (dto.dueDate !== undefined) updateData.due_date = dto.dueDate || null;
        if (dto.leadId !== undefined) updateData.lead_id = (dto.leadId && dto.leadId !== "") ? dto.leadId : null;
        if (dto.assigneeId !== undefined) updateData.assignee_id = (dto.assigneeId && dto.assigneeId !== "") ? dto.assigneeId : null;
        if (dto.completedAt !== undefined) updateData.completed_at = dto.completedAt || null;

        const { data, error } = await supabase
            .from(this.TABLE)
            .update(updateData)
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
        return { message: 'Task deleted' };
    }

    async bulkCreate(tasks: CreateTaskDto[], userId: string, workspaceId: string, organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();
        const rows = tasks.map((t) => {
            return {
                description: t.description,
                type: t.type || 'Todo',
                status: t.status || 'Pending',
                priority: t.priority || 'Medium',
                due_date: t.dueDate || null,
                lead_id: t.leadId && t.leadId !== "" ? t.leadId : null,
                assignee_id: (t.assigneeId && t.assigneeId !== "") ? t.assigneeId : userId,
                created_by: userId,
                workspace_id: workspaceId,
                organization_id: organizationId,
            };
        });
        const { data, error } = await supabase.from(this.TABLE).insert(rows).select();
        if (error) throw new BadRequestException(error.message);
        return { inserted: data.length, data };
    }
}
