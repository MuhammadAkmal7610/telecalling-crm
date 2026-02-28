import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class ReportsService {
    private readonly logger = new Logger(ReportsService.name);

    constructor(private readonly supabaseService: SupabaseService) { }

    async getDashboardStats(organizationId: string, userId: string) {
        const supabase = this.supabaseService.getAdminClient();

        // ---1. Get total leads
        const { data: leadData, error: leadError } = await supabase
            .from('leads')
            .select('status, created_at, assignee_id, created_by, source, assignee:users!assignee_id(name)')
            .eq('organization_id', organizationId);

        if (leadError) throw new BadRequestException(leadError.message);

        // ---2. Get activities (calls)
        const { data: activityData, error: activityError } = await supabase
            .from('activities')
            .select('type, created_at')
            .eq('organization_id', organizationId);

        if (activityError) throw new BadRequestException(activityError.message);

        // ---3. Get Call Followups
        const { data: taskData, error: taskError } = await supabase
            .from('tasks')
            .select('assignee_id, type, status, due_date, assignee:users!assignee_id(name)')
            .eq('organization_id', organizationId)
            .eq('type', 'CallFollowup');

        if (taskError) throw new BadRequestException(taskError.message);

        // ---4. Process data
        const totalLeads = leadData.length;
        const wonLeads = leadData.filter(l => l.status === 'Won').length;
        const totalCalls = activityData.filter(a => a.type === 'call').length;

        // ---Group Followups by Assignee
        const followUpsSummary = taskData.reduce((acc: Record<string, any>, task) => {
            const assigneeId = task.assignee_id || 'unassigned';
            if (!acc[assigneeId]) {
                acc[assigneeId] = {
                    name: (task.assignee as any)?.name || 'Unknown',
                    upcoming: 0,
                    late: 0,
                    done: 0,
                    cancel: 0,
                    initials: ((task.assignee as any)?.name || 'U').substring(0, 2).toUpperCase()
                };
            }
            if (task.status === 'Done') {
                acc[assigneeId].done++;
            } else if (task.status === 'Canceled') {
                acc[assigneeId].cancel++;
            } else {
                const isLate = new Date(task.due_date) < new Date();
                if (isLate) acc[assigneeId].late++;
                else acc[assigneeId].upcoming++;
            }
            return acc;
        }, {});

        // ---Group Leads by stage per Assignee
        const leadsByStageSummary = leadData.reduce((acc: Record<string, any>, lead) => {
            const assigneeId = lead.assignee_id || 'unassigned';
            if (!acc[assigneeId]) {
                acc[assigneeId] = {
                    name: (lead.assignee as any)?.name || 'Unknown',
                    fresh: 0,
                    active: 0,
                    won: 0,
                    lost: 0,
                    initials: ((lead.assignee as any)?.name || 'U').substring(0, 2).toUpperCase()
                };
            }
            const s = lead.status?.toLowerCase() || '';
            if (s === 'fresh') acc[assigneeId].fresh++;
            else if (s === 'won') acc[assigneeId].won++;
            else if (s === 'lost') acc[assigneeId].lost++;
            else acc[assigneeId].active++;
            return acc;
        }, {});

        // ---Filter Summary for Dashboard
        const getStats = (leads: any[]) => ({
            fresh: leads.filter(l => l.status?.toLowerCase() === 'fresh').length,
            active: leads.filter(l => !['fresh', 'won', 'lost'].includes(l.status?.toLowerCase())).length,
            won: leads.filter(l => l.status?.toLowerCase() === 'won').length,
            lost: leads.filter(l => l.status?.toLowerCase() === 'lost').length,
        });

        const filtersSummary = [
            { name: 'All Leads', ...getStats(leadData), path: '/all-leads' },
            { name: 'Leads Assigned to me', ...getStats(leadData.filter(l => l.assignee_id === userId)), path: '/assigned-leads' },
            { name: 'My Leads', ...getStats(leadData.filter(l => l.created_by === userId)), path: '/my-leads' },
            { name: 'Incoming Whatsapp Leads', ...getStats(leadData.filter(l => l.source?.toLowerCase() === 'whatsapp')), path: '/whatsapp-leads' },
        ];

        return {
            totalLeads,
            wonLeads,
            totalCalls,
            conversionRate: totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0,
            statusBreakdown: leadData.reduce((acc: Record<string, number>, l) => {
                acc[l.status] = (acc[l.status] || 0) + 1;
                return acc;
            }, {}),
            followUpsSummary: Object.values(followUpsSummary).filter((s: any) => s.name !== 'Unknown'),
            leadsByStageSummary: Object.values(leadsByStageSummary).filter((s: any) => s.name !== 'Unknown'),
            filtersSummary,
            tasksSummary: {
                late: Object.values(followUpsSummary).reduce((sum: number, s: any) => sum + s.late, 0),
                pending: Object.values(followUpsSummary).reduce((sum: number, s: any) => sum + s.upcoming, 0),
                done: Object.values(followUpsSummary).reduce((sum: number, s: any) => sum + s.done, 0),
                created: taskData.length
            }
        };
    }

    async getUserPerformance(organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();

        // ---added by akmal--Get activities grouped by user
        const { data, error } = await supabase
            .from('activities')
            .select('user_id, type, users(name)')
            .eq('organization_id', organizationId);

        if (error) throw new BadRequestException(error.message);

        // ---added by akmal--Get leads to calculate sales per user
        const { data: leadData, error: leadError } = await supabase
            .from('leads')
            .select('assignee_id, status')
            .eq('organization_id', organizationId);

        if (leadError) throw new BadRequestException(leadError.message);

        const performance = data.reduce((acc: Record<string, any>, act) => {
            const userId = act.user_id;
            if (!acc[userId]) {
                acc[userId] = {
                    name: (act.users as any)?.name || 'Unknown',
                    calls: 0,
                    notes: 0,
                    sales: 0
                };
            }
            if (act.type === 'call') acc[userId].calls++;
            if (act.type === 'note') acc[userId].notes++;
            return acc;
        }, {});

        // ---added by akmal--Add sales data
        for (const lead of leadData) {
            if (lead.status === 'Won' && lead.assignee_id) {
                if (performance[lead.assignee_id]) {
                    performance[lead.assignee_id].sales++;
                }
            }
        }

        return Object.values(performance);
    }

    async getReports(organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from('reports')
            .select('*, creator:users!created_by(id,name)')
            .eq('organization_id', organizationId)
            .order('created_at', { ascending: false });

        if (error) throw new BadRequestException(error.message);
        return data;
    }

    async createReportMetadata(organizationId: string, userId: string, data: { name: string, type: string, size?: string, url?: string }) {
        const supabase = this.supabaseService.getAdminClient();
        const { data: report, error } = await supabase
            .from('reports')
            .insert({
                ...data,
                organization_id: organizationId,
                created_by: userId
            })
            .select()
            .single();

        if (error) throw new BadRequestException(error.message);
        return report;
    }
}
