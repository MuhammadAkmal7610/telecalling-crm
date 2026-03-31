import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { ActivitiesService } from '../activities/activities.service';
import { ActivityType } from '../activities/dto/activity.dto';
import { LeadsService } from '../leads/leads.service';
import { LeadStatus } from '../leads/dto/lead.dto';

export interface CreateCallDto {
    lead_id: string;
    agent_id: string;
    status: 'initiated' | 'connected' | 'missed' | 'voicemail' | 'ended';
    duration?: number;
    recording_url?: string;
    transcript?: string;
    notes?: string;
    call_status?: string;
    direction?: 'inbound' | 'outbound';
    workspace_id: string;
    organization_id: string;
}

export interface UpdateCallDto {
    status?: 'initiated' | 'connected' | 'missed' | 'voicemail' | 'ended';
    duration?: number;
    recording_url?: string;
    transcript?: string;
    notes?: string;
    call_status?: string;
}

@Injectable()
export class TelephonyService {
    private readonly logger = new Logger(TelephonyService.name);
    private readonly CALLS_TABLE = 'calls';

    constructor(
        private readonly supabaseService: SupabaseService,
        private readonly notificationsService: NotificationsService,
        private readonly notificationsGateway: NotificationsGateway,
        private readonly activitiesService: ActivitiesService,
        private readonly leadsService: LeadsService,
    ) { }

    async initiateCall(createCallDto: CreateCallDto, user: any) {
        const supabase = this.supabaseService.getAdminClient();

        // Create call record
        const { data: call, error } = await supabase
            .from(this.CALLS_TABLE)
            .insert({
                ...createCallDto,
                started_at: new Date().toISOString(),
                created_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) throw new BadRequestException(error.message);

        // Log activity
        await this.activitiesService.create({
            type: ActivityType.CALL,
            title: 'Call Initiated',
            details: `Call started with lead`,
            leadId: createCallDto.lead_id,
        }, createCallDto.agent_id || user.id, createCallDto.workspace_id, createCallDto.organization_id);

        // Send real-time notification
        this.notificationsGateway.sendCallUpdate(createCallDto.organization_id, {
            action: 'call_started',
            call,
            lead_id: createCallDto.lead_id,
            agent_id: createCallDto.agent_id,
        });

        this.logger.log(`Call initiated for lead ${createCallDto.lead_id}`);
        return call;
    }

    async updateCall(callId: string, updateCallDto: UpdateCallDto, userId: string) {
        const supabase = this.supabaseService.getAdminClient();

        // Get existing call
        const { data: existingCall, error: fetchError } = await supabase
            .from(this.CALLS_TABLE)
            .select('*')
            .eq('id', callId)
            .single();

        if (fetchError || !existingCall) {
            throw new BadRequestException('Call not found');
        }

        // Update call
        const { data: updatedCall, error } = await supabase
            .from(this.CALLS_TABLE)
            .update({
                ...updateCallDto,
                ended_at: updateCallDto.status === 'ended' ? new Date().toISOString() : existingCall.ended_at,
                updated_at: new Date().toISOString(),
            })
            .eq('id', callId)
            .select()
            .single();

        if (error) throw new BadRequestException(error.message);

        // Log activity based on status
        if (updateCallDto.status === 'ended') {
            await this.activitiesService.create({
                type: ActivityType.CALL,
                title: 'Call Ended',
                details: `Call completed - Duration: ${this.formatDuration(existingCall.duration || 0)}`,
                leadId: existingCall.lead_id,
            }, userId, existingCall.workspace_id, existingCall.organization_id);

            // Update Lead Status based on Call Outcome
            if (updateCallDto.call_status) {
                await this.handleLeadStatusUpdate(existingCall.lead_id, updateCallDto.call_status, userId, existingCall.workspace_id, existingCall.organization_id);
            }
        }

        // Send real-time update
        this.notificationsGateway.sendCallUpdate(existingCall.organization_id, {
            action: 'call_updated',
            call: updatedCall,
            lead_id: existingCall.lead_id,
            agent_id: existingCall.agent_id,
        });

        this.logger.log(`Call ${callId} updated to status: ${updateCallDto.status}`);
        return updatedCall;
    }

    async getCalls(filters: {
        workspace_id: string;
        agent_id?: string;
        lead_id?: string;
        status?: string;
        date_from?: string;
        date_to?: string;
        limit?: number;
        offset?: number;
    }) {
        const supabase = this.supabaseService.getAdminClient();
        let query = supabase
            .from(this.CALLS_TABLE)
            .select(`
                *,
                lead:leads(id, name, phone, email),
                agent:users(id, name, email)
            `)
            .eq('workspace_id', filters.workspace_id);

        // Apply filters
        if (filters.agent_id) {
            query = query.eq('agent_id', filters.agent_id);
        }
        if (filters.lead_id) {
            query = query.eq('lead_id', filters.lead_id);
        }
        if (filters.status) {
            query = query.eq('status', filters.status);
        }
        if (filters.date_from) {
            query = query.gte('created_at', filters.date_from);
        }
        if (filters.date_to) {
            query = query.lte('created_at', filters.date_to);
        }

        // Apply pagination
        if (filters.limit) {
            query = query.limit(filters.limit);
        }

        // Order by creation date
        query = query.order('created_at', { ascending: false });

        const { data, error } = await query;
        if (error) throw new BadRequestException(error.message);

        return data || [];
    }

    async getCallSummary(workspaceId: string, timeRange: string = 'today') {
        const supabase = this.supabaseService.getAdminClient();

        // Calculate date range
        const now = new Date();
        let dateFrom: Date;

        switch (timeRange) {
            case 'today':
                dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'yesterday':
                dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
                break;
            case 'week':
                dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                dateFrom = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            default:
                dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        }

        const dateTo = new Date();

        // Get call statistics
        const { data, error } = await supabase
            .from(this.CALLS_TABLE)
            .select('status, duration, call_status, agent_id')
            .eq('workspace_id', workspaceId)
            .gte('created_at', dateFrom.toISOString())
            .lte('created_at', dateTo.toISOString());

        if (error) throw new BadRequestException(error.message);

        const calls = data || [];
        const totalCalls = calls.length;
        const connectedCalls = calls.filter(c => c.status === 'connected').length;
        const missedCalls = calls.filter(c => c.status === 'missed').length;
        const voicemailCalls = calls.filter(c => c.status === 'voicemail').length;
        const totalTalkTime = calls.reduce((sum, c) => sum + (c.duration || 0), 0);

        // Get previous period for comparison
        const previousPeriodFrom = new Date(dateFrom.getTime() - (dateTo.getTime() - dateFrom.getTime()));
        const previousPeriodTo = new Date(dateFrom);

        const { data: previousData } = await supabase
            .from(this.CALLS_TABLE)
            .select('status, duration')
            .eq('workspace_id', workspaceId)
            .gte('created_at', previousPeriodFrom.toISOString())
            .lte('created_at', previousPeriodTo.toISOString());

        const previousCalls = previousData || [];
        const previousTotalCalls = previousCalls.length;
        const previousConnectedCalls = previousCalls.filter(c => c.status === 'connected').length;

        // Calculate percentage changes
        const callsChange = previousTotalCalls > 0 ?
            Math.round(((totalCalls - previousTotalCalls) / previousTotalCalls) * 100) : 0;
        const connectedChange = previousConnectedCalls > 0 ?
            Math.round(((connectedCalls - previousConnectedCalls) / previousConnectedCalls) * 100) : 0;

        return {
            totalCalls,
            connectedCalls,
            missedCalls,
            voicemailCalls,
            totalTalkTime,
            callsChange,
            connectedChange,
            averageCallDuration: totalCalls > 0 ? Math.round(totalTalkTime / totalCalls) : 0,
        };
    }

    async getCallAnalytics(workspaceId: string, timeRange: string = 'week') {
        const supabase = this.supabaseService.getAdminClient();

        // Get call volume by day
        const now = new Date();
        let daysBack = 7;

        switch (timeRange) {
            case 'day': daysBack = 1; break;
            case 'week': daysBack = 7; break;
            case 'month': daysBack = 30; break;
        }

        const dateFrom = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

        const { data, error } = await supabase
            .from(this.CALLS_TABLE)
            .select('created_at, status')
            .eq('workspace_id', workspaceId)
            .gte('created_at', dateFrom.toISOString())
            .order('created_at', { ascending: true });

        if (error) throw new BadRequestException(error.message);

        // Group calls by day
        const callVolume = this.groupCallsByDay(data || [], daysBack);

        return {
            callVolume,
            timeRange,
        };
    }

    async getCallRecordings(workspaceId: string, limit: number = 50) {
        const supabase = this.supabaseService.getAdminClient();

        const { data, error } = await supabase
            .from(this.CALLS_TABLE)
            .select(`
                *,
                lead:leads(id, name, phone, email),
                agent:users(id, name, email)
            `)
            .eq('workspace_id', workspaceId)
            .not('recording_url', 'is', null)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw new BadRequestException(error.message);

        return data || [];
    }

    async getNextLeadToCall(workspaceId: string, agentId?: string) {
        const supabase = this.supabaseService.getAdminClient();

        // Get leads that need to be called
        let query = supabase
            .from('leads')
            .select('*')
            .eq('workspace_id', workspaceId)
            .in('status', ['Fresh', 'First Contact Attempted'])
            .order('created_at', { ascending: true })
            .limit(1);

        // If agent is specified, get their assigned leads
        if (agentId) {
            query = query.eq('assignee_id', agentId);
        }

        const { data, error } = await query;
        if (error) throw new BadRequestException(error.message);

        return data && data.length > 0 ? data[0] : null;
    }

    private groupCallsByDay(calls: any[], daysBack: number) {
        const callVolume = [];
        const now = new Date();

        for (let i = daysBack - 1; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const dateStr = date.toISOString().split('T')[0];

            const dayCalls = calls.filter(call =>
                call.created_at.split('T')[0] === dateStr
            );

            callVolume.push({
                date: dateStr,
                total: dayCalls.length,
                connected: dayCalls.filter(c => c.status === 'connected').length,
                missed: dayCalls.filter(c => c.status === 'missed').length,
            });
        }

        return callVolume;
    }

    private async handleLeadStatusUpdate(leadId: string, callStatus: string, userId: string, workspaceId: string, organizationId: string) {
        let newStatus: LeadStatus | null = null;
        const normalizedStatus = callStatus.toUpperCase();

        if (normalizedStatus === 'CONNECTED') {
            newStatus = LeadStatus.ACTIVE;
        } else if (normalizedStatus === 'INTERESTED') {
            newStatus = LeadStatus.INTERESTED;
        } else if (normalizedStatus === 'NOT INTERESTED') {
            newStatus = LeadStatus.COLD;
        } else if (normalizedStatus === 'WRONG NUMBER') {
            newStatus = LeadStatus.TRASH;
        } else if (['NO ANSWER', 'NUMBER BUSY', 'SWITCHED OFF'].includes(normalizedStatus)) {
            // Keep current but maybe log as an attempt (handled by activity log)
        }

        if (newStatus) {
            try {
                await this.leadsService.updateStatus(leadId, newStatus, {
                    id: userId,
                    workspaceId,
                    organizationId
                });
            } catch (err) {
                this.logger.error(`Failed to automatically update lead status for ${leadId}: ${err.message}`);
            }
        }
    }

    async logCall(createCallDto: CreateCallDto) {
        const supabase = this.supabaseService.getAdminClient();

        const { data: call, error } = await supabase
            .from(this.CALLS_TABLE)
            .insert({
                ...createCallDto,
                started_at: new Date().toISOString(),
                ended_at: new Date().toISOString(),
                created_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) throw new BadRequestException(error.message);

        // Log activity
        await this.activitiesService.create({
            type: ActivityType.CALL,
            title: 'Bulk/Manual Call Logged',
            details: `Call logged for lead with status: ${createCallDto.status}`,
            leadId: createCallDto.lead_id,
        }, createCallDto.agent_id, createCallDto.workspace_id, createCallDto.organization_id);

        return call;
    }

    private formatDuration(seconds: number): string {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    }
}
