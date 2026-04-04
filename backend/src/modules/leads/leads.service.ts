import {
    Injectable, Logger, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateLeadDto, UpdateLeadDto, LeadQueryDto, LeadStatus } from './dto/lead.dto';
import { WorkflowsEngineService } from '../workflows/workflows-engine.service';
import { ActivitiesService } from '../activities/activities.service';
import { ActivityType } from '../activities/dto/activity.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class LeadsService {
    private readonly logger = new Logger(LeadsService.name);
    private readonly TABLE = 'leads';

    constructor(
        private readonly supabaseService: SupabaseService,
        private readonly workflowsEngineService: WorkflowsEngineService,
        private readonly activitiesService: ActivitiesService,
        private readonly notificationsService: NotificationsService,
        private readonly notificationsGateway: NotificationsGateway
    ) { }

    private mapDtoToDb(dto: CreateLeadDto | UpdateLeadDto) {
        const {
            altPhone, alt_phone,
            stageId, stage_id,
            assigneeId, assignee_id,
            customFields, custom_fields,
            organizationId,
            ...rest
        } = dto;

        return {
            ...rest,
            alt_phone: altPhone || alt_phone,
            stage_id: stageId || stage_id,
            assignee_id: assigneeId || assignee_id,
            custom_fields: customFields || custom_fields,
            ...(organizationId && { organization_id: organizationId }),
        };
    }

    private mapDbToDto(db: any) {
        if (!db) return null;
        const {
            alt_phone,
            stage_id,
            assignee_id,
            custom_fields,
            organization_id,
            workspace_id,
            created_at,
            updated_at,
            ...rest
        } = db;

        return {
            ...rest,
            altPhone: alt_phone,
            stageId: stage_id,
            assigneeId: assignee_id,
            customFields: custom_fields,
            organizationId: organization_id,
            workspaceId: workspace_id,
            createdAt: created_at,
            updatedAt: updated_at,
        };
    }

    async create(createLeadDto: CreateLeadDto, user: any) {
        const workspaceId = user.workspaceId;
        const organizationId = user.organizationId;

        // Validate workspaceId is present
        if (!workspaceId || workspaceId === 'null' || workspaceId === 'undefined') {
            throw new BadRequestException('Workspace ID is required. Please select a workspace.');
        }

        const mappedDto = this.mapDtoToDb(createLeadDto);

        const supabase = this.supabaseService.getAdminClient();

        // If stage_id is missing, find and assign the default stage for the workspace
        if (!mappedDto.stage_id) {
            const { data: defaultStage } = await supabase
                .from('lead_stages')
                .select('id')
                .eq('workspace_id', workspaceId)
                .eq('is_default', true)
                .limit(1)
                .maybeSingle();
            
            if (defaultStage) {
                mappedDto.stage_id = defaultStage.id;
            } else {
                // Fallback to the first stage if no explicit default is set
                const { data: firstStage } = await supabase
                    .from('lead_stages')
                    .select('id')
                    .eq('workspace_id', workspaceId)
                    .order('position', { ascending: true })
                    .limit(1)
                    .maybeSingle();
                if (firstStage) mappedDto.stage_id = firstStage.id;
            }
        }

        const { data, error } = await supabase
            .from(this.TABLE)
            .insert({
                ...mappedDto,
                workspace_id: workspaceId,
                organization_id: organizationId,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) throw new BadRequestException(error.message);

        // Log Activity
        await this.activitiesService.create({
            type: ActivityType.NOTE,
            title: 'Lead Created',
            details: `New lead created: ${data.name}`,
            leadId: data.id
        }, user.id, workspaceId, organizationId);

        // Send real-time notification
        if (this.notificationsGateway) {
            this.notificationsGateway.sendLeadUpdate(organizationId, {
                id: data.id,
                action: 'lead_created',
                lead: data,
                user: {
                    id: user.id,
                    name: user.name || 'System'
                }
            });
        }

        // Persistent Notification
        await this.notificationsService.triggerLeadNotification(
            organizationId,
            data.assignee_id || user.id,
            data.name,
            'created'
        );

        if (data.assignee_id && data.assignee_id !== user.id) {
            await this.notificationsService.triggerLeadNotification(
                organizationId,
                data.assignee_id,
                data.name,
                'assigned'
            );
        }

        // Trigger Workflows
        try {
            await this.workflowsEngineService.processLead(data, 'lead_created', {
                user,
                workspaceId,
                organizationId
            });
        } catch (err) {
            this.logger.error(`Failed to process workflow for lead creation: ${err.message}`);
        }

        return data;
    }

    async findAll(query: LeadQueryDto, user: any) {
        const workspaceId = user.workspaceId;
        if (!workspaceId || workspaceId === 'null' || workspaceId === 'undefined') {
            return [];
        }
        const supabase = this.supabaseService.getAdminClient();
        let dbQuery = supabase
            .from(this.TABLE)
            .select(`
                *,
                assignee:users!leads_assignee_id_fkey(id, name, email),
                stage:lead_stages!leads_stage_id_fkey(id, name, color)
            `)
            .eq('workspace_id', workspaceId);

        // Apply filters
        if (query.status) {
            dbQuery = dbQuery.eq('status', query.status);
        }
        if (query.assigneeId) {
            dbQuery = dbQuery.eq('assignee_id', query.assigneeId);
        }
        if (query.stageId) {
            dbQuery = dbQuery.eq('stage_id', query.stageId);
        }
        if (query.search) {
            dbQuery = dbQuery.or(`name.ilike.%${query.search}%,email.ilike.%${query.search}%,phone.ilike.%${query.search}%`);
        }

        // Apply timeRange filter
        if (query.timeRange) {
            const now = new Date();
            const fromDate = new Date();

            if (query.timeRange === '7d') fromDate.setDate(now.getDate() - 7);
            else if (query.timeRange === '30d') fromDate.setDate(now.getDate() - 30);
            else if (query.timeRange === '90d') fromDate.setDate(now.getDate() - 90);
            else if (query.timeRange === '1y') fromDate.setFullYear(now.getFullYear() - 1);

            if (query.timeRange !== 'all') {
                dbQuery = dbQuery.gte('created_at', fromDate.toISOString());
            }
        }

        // Apply pagination
        if (query.limit) {
            dbQuery = dbQuery.limit(query.limit);
        }

        // Apply ordering - using default ordering
        dbQuery = dbQuery.order('created_at', { ascending: false });

        const { data, error } = await dbQuery;

        if (error) throw new BadRequestException(error.message);

        return data?.map(lead => this.mapDbToDto(lead)) || [];
    }

    async findOne(id: string, workspaceId: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from(this.TABLE)
            .select(`
                *,
                assignee:users!leads_assignee_id_fkey(id, name, email),
                stage:lead_stages!leads_stage_id_fkey(id, name, color)
            `)
            .eq('id', id)
            .eq('workspace_id', workspaceId)
            .single();

        if (error || !data) {
            throw new NotFoundException('Lead not found');
        }

        return this.mapDbToDto(data);
    }

    async update(id: string, updateLeadDto: UpdateLeadDto, user: any) {
        const workspaceId = user.workspaceId;
        const organizationId = user.organizationId;
        const mappedDto = this.mapDtoToDb(updateLeadDto);

        // Check if lead exists and user has access
        const existingLead = await this.findOne(id, workspaceId);

        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from(this.TABLE)
            .update({
                ...mappedDto,
                organization_id: organizationId,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .eq('workspace_id', workspaceId)
            .select()
            .single();

        if (error) throw new BadRequestException(error.message);

        // Log Activity for status change
        if (updateLeadDto.status && updateLeadDto.status !== existingLead.status) {
            await this.activitiesService.create({
                type: ActivityType.STATUS_CHANGE,
                title: 'Status Changed',
                details: `Status changed from ${existingLead.status} to ${updateLeadDto.status}`,
                leadId: id
            }, user.id, workspaceId, organizationId);
        }

        // Trigger Workflows for status change
        if (updateLeadDto.status && updateLeadDto.status !== existingLead.status) {
            try {
                await this.workflowsEngineService.processLead({
                    ...data,
                    previousStatus: existingLead.status,
                    newStatus: updateLeadDto.status
                }, 'status_changed', {
                    user,
                    workspaceId,
                    organizationId,
                    previousStatus: existingLead.status,
                    newStatus: updateLeadDto.status
                });
            } catch (err) {
                this.logger.error(`Failed to process workflow for status change: ${err.message}`);
            }
        }

        return data;
    }

    async remove(id: string, workspaceId: string) {
        // Check if lead exists
        await this.findOne(id, workspaceId);

        const supabase = this.supabaseService.getAdminClient();
        const { error } = await supabase
            .from(this.TABLE)
            .delete()
            .eq('id', id)
            .eq('workspace_id', workspaceId);

        if (error) throw new BadRequestException(error.message);

        return { message: 'Lead deleted successfully' };
    }

    async bulkImport(leads: CreateLeadDto[], user: any) {
        const workspaceId = user.workspaceId;
        const organizationId = user.organizationId;
        const supabase = this.supabaseService.getAdminClient();

        const mappedLeads = leads.map(lead => ({
            ...this.mapDtoToDb(lead),
            workspace_id: workspaceId,
            organization_id: organizationId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }));

        const { data, error } = await supabase
            .from(this.TABLE)
            .insert(mappedLeads)
            .select();

        if (error) throw new BadRequestException(error.message);

        // Log activities for each lead
        if (data && data.length > 0) {
            data.forEach(lead => {
                this.activitiesService.create({
                    type: ActivityType.NOTE,
                    title: 'Lead Imported',
                    details: `Lead imported: ${lead.name}`,
                    leadId: lead.id
                }, user.id, workspaceId, organizationId).catch((err: Error) =>
                    this.logger.error(`Failed to log activity for imported lead ${lead.id}: ${err.message}`)
                );
            });
        }

        return { inserted: data?.length || 0, data };
    }

    async bulkAssign(leadIds: string[], assigneeId: string, user: any) {
        const workspaceId = user.workspaceId;
        const organizationId = user.organizationId;
        if (!workspaceId) throw new BadRequestException('Workspace ID is required');
        const supabase = this.supabaseService.getAdminClient();

        const { data, error } = await supabase
            .from(this.TABLE)
            .update({ assignee_id: assigneeId, updated_at: new Date().toISOString() })
            .in('id', leadIds)
            .eq('workspace_id', workspaceId)
            .select();

        if (error) throw new BadRequestException(error.message);

        // Log activities for each lead
        if (data && data.length > 0) {
            data.forEach(lead => {
                this.activitiesService.create({
                    type: ActivityType.NOTE,
                    title: 'Lead Assigned',
                    details: `Lead assigned to ${assigneeId} by ${user.name || 'System'}`,
                    leadId: lead.id
                }, user.id, workspaceId, organizationId).catch((err: Error) =>
                    this.logger.error(`Failed to log assignment for lead ${lead.id}: ${err.message}`)
                );

                // Trigger Persistent Notification
                this.notificationsService.triggerLeadNotification(
                    organizationId,
                    assigneeId,
                    lead.name,
                    'assigned'
                ).catch(err => this.logger.error(`Failed to trigger notification: ${err.message}`));
            });
        }

        return { count: data?.length || 0, data };
    }

    async updateStage(id: string, stageId: string, user: any) {
        const supabase = this.supabaseService.getAdminClient();
        const workspaceId = user.workspaceId;
        const organizationId = user.organizationId;

        // Validate lead exists and user has access
        const lead = await this.findOne(id, workspaceId);
        if (!lead) {
            throw new BadRequestException('Lead not found');
        }

        // Validate stage exists
        const { data: stage, error: stageError } = await supabase
            .from('lead_stages')
            .select('*')
            .eq('id', stageId)
            .eq('workspace_id', workspaceId)
            .single();

        if (stageError || !stage) {
            throw new BadRequestException('Stage not found');
        }

        const oldStageId = lead.stageId;

        // Update lead stage
        const { data: updatedLead, error } = await supabase
            .from(this.TABLE)
            .update({ 
                stage_id: stageId,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .eq('workspace_id', workspaceId)
            .select()
            .single();

        if (error) throw new BadRequestException(error.message);

        // Log activity
        try {
            await this.activitiesService.create({
                type: ActivityType.STAGE_CHANGE,
                title: 'Stage Changed',
                details: `Lead moved from stage to stage`,
                leadId: id
            }, user.id, workspaceId, organizationId);
        } catch (err) {
            this.logger.error(`Failed to log stage change activity: ${err.message}`);
        }

        // Send real-time update
        if (this.notificationsGateway) {
            this.notificationsGateway.sendLeadUpdate(organizationId, {
                id,
                action: 'stage_changed',
                old_stage_id: oldStageId,
                new_stage_id: stageId,
                lead: updatedLead
            });
        }

        // Persistent Notification
        if (updatedLead.assignee_id) {
            await this.notificationsService.triggerLeadNotification(
                organizationId,
                updatedLead.assignee_id,
                updatedLead.name,
                'updated'
            );
        }

        return updatedLead;
    }

    async assignLead(leadId: string, assigneeId: string, user: any) {
        return this.update(leadId, { assigneeId } as UpdateLeadDto, user);
    }

    async updateStatus(leadId: string, status: LeadStatus, user: any, lostReason?: string) {
        const lead = await this.update(leadId, { status, lostReason } as UpdateLeadDto, user);

        // Log Activity
        await this.activitiesService.create({
            type: ActivityType.STATUS_CHANGE,
            title: 'Status Changed',
            details: `Status changed to ${status}${lostReason ? ` - Reason: ${lostReason}` : ''}`,
            leadId
        }, user.id, user.workspaceId, user.organizationId).catch((err: Error) =>
            this.logger.error(`Failed to log status change activity for lead ${leadId}: ${err.message}`)
        );

        return lead;
    }

    async getStats(user: any) {
        const workspaceId = user.workspaceId;
        const organizationId = user.organizationId;
        const supabase = this.supabaseService.getAdminClient();

        const { data, error } = await supabase
            .from(this.TABLE)
            .select('status')
            .eq('workspace_id', workspaceId);

        if (error) throw new BadRequestException(error.message);

        const stats = data?.reduce((acc, lead) => {
            acc[lead.status] = (acc[lead.status] || 0) + 1;
            acc.total = (acc.total || 0) + 1;
            return acc;
        }, {} as any) || { total: 0 };

        return stats;
    }

    async getDuplicates(workspaceId: string, type: 'phone' | 'email' | 'name' = 'phone', limit: number = 10) {
        const supabase = this.supabaseService.getAdminClient();
        
        const column = type === 'phone' ? 'phone' : type === 'email' ? 'email' : 'name';
        
        // Simplified duplicate detection - using basic query
        const { data, error } = await supabase
            .from(this.TABLE)
            .select(`${column}, count(*)`)
            .eq('workspace_id', workspaceId)
            .not(column, 'is', null)
            .limit(limit);

        if (error) throw new BadRequestException(error.message);

        return data || [];
    }
}
