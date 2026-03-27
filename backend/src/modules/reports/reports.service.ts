import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class ReportsService {
    private readonly logger = new Logger(ReportsService.name);

    constructor(private readonly supabaseService: SupabaseService) { }

    async getDashboardStats(organizationId: string, userId: string, workspaceIdFromHeader: string | null, timeRange: string = '7d') {
        const supabase = this.supabaseService.getAdminClient();

        let workspaceId = workspaceIdFromHeader;

        if (!workspaceId) {
            // Fallback: Get user's current workspace from DB if header is missing
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('workspace_id')
                .eq('id', userId)
                .single();

            if (userError) throw new BadRequestException(`Workspace error: ${userError.message}`);
            workspaceId = userData?.workspace_id;
        }

        if (!workspaceId) throw new BadRequestException('User workspace not found. Please select a workspace.');

        // ---Date Range Logic---
        const now = new Date();
        let days = 7;
        if (timeRange === '1d') days = 1;
        else if (timeRange === '7d') days = 7;
        else if (timeRange === '30d') days = 30;
        else if (timeRange === '90d') days = 90;

        const currentStart = new Date(now);
        currentStart.setDate(now.getDate() - days);
        const previousStart = new Date(currentStart);
        previousStart.setDate(currentStart.getDate() - days);

        // ---1. Get all leads for current workspace (needed for summaries)
        const { data: leadData, error: leadError } = await supabase
            .from('leads')
            .select('status, created_at, assignee_id, created_by, source, custom_fields, assignee:users!assignee_id(name)')
            .eq('organization_id', organizationId)
            .eq('workspace_id', workspaceId);

        if (leadError) throw new BadRequestException(leadError.message);

        // ---2. Get all activities (calls) for current workspace
        const { data: activityData, error: activityError } = await supabase
            .from('activities')
            .select('id, type, details, created_at')
            .eq('organization_id', organizationId)
            .eq('workspace_id', workspaceId);

        if (activityError) throw new BadRequestException(activityError.message);

        // ---3. Get all Call Followups for current workspace
        const { data: taskData, error: taskError } = await supabase
            .from('tasks')
            .select('assignee_id, type, status, due_date, priority, assignee:users!assignee_id(name)')
            .eq('organization_id', organizationId)
            .eq('workspace_id', workspaceId)
            .eq('type', 'CallFollowup');

        if (taskError) throw new BadRequestException(taskError.message);

        // ---4. Filter data for current and previous period---
        const filterByRange = (data: any[], start: Date, end: Date, dateField: string = 'created_at') => {
            return data.filter(item => {
                const date = new Date(item[dateField]);
                return date >= start && date < end;
            });
        };

        const currentLeads = filterByRange(leadData, currentStart, now);
        const previousLeads = filterByRange(leadData, previousStart, currentStart);

        const currentActivities = filterByRange(activityData, currentStart, now);
        const previousActivities = filterByRange(activityData, previousStart, currentStart);

        const currentTasks = filterByRange(taskData, currentStart, now, 'due_date');
        const previousTasks = filterByRange(taskData, previousStart, currentStart, 'due_date');

        // ---5. Calculate Metrics---
        const calculateRevenue = (leads: any[]) => {
            return leads
                .filter(l => l.status === 'Won')
                .reduce((sum, lead) => {
                    const val = parseFloat((lead.custom_fields as any)?.value || (lead.custom_fields as any)?.deal_value || 0);
                    return sum + (isNaN(val) ? 0 : val);
                }, 0);
        };

        const currentRevenue = calculateRevenue(currentLeads);
        const previousRevenue = calculateRevenue(previousLeads);

        const calculateChange = (current: number, previous: number) => {
            if (previous === 0) return { change: '0%', changeType: 'increase' as const };
            const percent = ((current - previous) / previous) * 100;
            return {
                change: `${percent > 0 ? '+' : ''}${percent.toFixed(0)}%`,
                changeType: percent >= 0 ? 'increase' as const : 'decrease' as const
            };
        };

        const leadTrend = calculateChange(currentLeads.length, previousLeads.length);
        const callTrend = calculateChange(
            currentActivities.filter(a => a.type === 'call').length,
            previousActivities.filter(a => a.type === 'call').length
        );
        const taskTrend = calculateChange(
            currentTasks.filter(t => t.status !== 'Done').length,
            previousTasks.filter(t => t.status !== 'Done').length
        );
        const revenueTrend = calculateChange(currentRevenue, previousRevenue);

        // ---6. Process original summaries (keep them workspace-wide for now or range-based?)
        // The original code used full workspace data for these summaries.
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

        // ---7. Chart Data Calculations---
        const leadByStatus = leadData.reduce((acc: any[], lead) => {
            const status = lead.status || 'Unknown';
            const existing = acc.find(i => i.name === status);
            if (existing) existing.value++;
            else acc.push({ name: status, value: 1 });
            return acc;
        }, []);

        const taskByPriority = taskData.reduce((acc: any[], task) => {
            const priority = task.priority || 'Medium';
            const existing = acc.find(i => i.priority === priority);
            if (existing) existing.count++;
            else acc.push({ priority, count: 1 });
            return acc;
        }, []);

        const callActivity = currentActivities
            .filter(a => a.type === 'call')
            .reduce((acc: any[], act) => {
                const date = new Date(act.created_at).toLocaleDateString();
                const existing = acc.find(i => i.date === date);
                if (existing) existing.calls++;
                else acc.push({ date, calls: 1 });
                return acc;
            }, [])
            .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const revenueOverTime = currentLeads
            .filter(l => l.status === 'Won')
            .reduce((acc: any[], lead) => {
                const date = new Date(lead.created_at).toLocaleDateString();
                const val = parseFloat((lead.custom_fields as any)?.value || (lead.custom_fields as any)?.deal_value || 0);
                const bitVal = isNaN(val) ? 0 : val;
                const existing = acc.find(i => i.date === date);
                if (existing) existing.amount += bitVal;
                else acc.push({ date, amount: bitVal });
                return acc;
            }, [])
            .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Performance data (limit to agents in this workspace)
        const performance = Object.values(leadsByStageSummary).map((s: any) => ({
            name: s.name,
            calls: Object.values(followUpsSummary).find((f: any) => f.name === s.name)?.done || 0,
            tasks: Object.values(followUpsSummary).find((f: any) => f.name === s.name)?.upcoming || 0,
            leads: s.active + s.fresh + s.won + s.lost,
            conversion: (s.won / (s.won + s.lost || 1)) * 100
        }));

        return {
            totalLeads: currentLeads.length,
            leadTrend,
            activeTasks: currentTasks.filter(t => t.status !== 'Done').length,
            taskTrend,
            totalCalls: currentActivities.filter(a => a.type === 'call').length,
            callTrend,
            revenue: currentRevenue,
            revenueTrend,
            wonLeads: currentLeads.filter(l => l.status === 'Won').length,
            conversionRate: currentLeads.length > 0 ? (currentLeads.filter(l => l.status === 'Won').length / currentLeads.length) * 100 : 0,
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
            },
            leadByStatus,
            taskByPriority,
            callActivity,
            revenueOverTime,
            performance,
            activities: currentActivities.slice(0, 10).map(a => ({
                id: a.id,
                type: a.type,
                title: a.type?.replace(/_/g, ' ')?.toUpperCase() || 'Activity',
                description: typeof a.details === 'string' ? a.details : JSON.stringify(a.details),
                time: new Date(a.created_at).toLocaleTimeString()
            })),
            labels: {
                totalLeads: 'Total Leads',
                activeTasks: 'Active Tasks',
                totalCalls: 'Total Calls',
                revenue: 'Revenue',
                leadsByStatus: 'Leads by Status',
                tasksByPriority: 'Tasks by Priority',
                callActivity: 'Call Activity',
                revenueOverTime: 'Revenue Over Time',
                quickActions: 'Quick Actions',
                addLead: 'Add Lead',
                createTask: 'Create Task',
                viewPipeline: 'View Pipeline',
                reports: 'Reports'
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

    async getWorkspaceLeadsBySource(workspaceId: string, organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from('leads')
            .select('source')
            .eq('workspace_id', workspaceId)
            .eq('organization_id', organizationId);

        if (error) throw new BadRequestException(error.message);

        const counts = data.reduce((acc: Record<string, number>, lead) => {
            const source = lead.source || 'Unknown';
            acc[source] = (acc[source] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(counts).map(([source, count]) => ({ source, count }));
    }

    async getWorkspaceConversionRate(workspaceId: string, organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from('leads')
            .select('status')
            .eq('workspace_id', workspaceId)
            .eq('organization_id', organizationId);

        if (error) throw new BadRequestException(error.message);

        const total = data.length;
        const won = data.filter(l => l.status === 'Won').length;

        return {
            total,
            won,
            rate: total > 0 ? (won / total) * 100 : 0
        };
    }

    async getWorkspaceSalesPerformance(workspaceId: string, organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from('leads')
            .select('status, custom_fields')
            .eq('workspace_id', workspaceId)
            .eq('organization_id', organizationId);

        if (error) throw new BadRequestException(error.message);

        const wonLeads = data.filter(l => l.status === 'Won');
        const revenue = wonLeads.reduce((sum, lead) => {
            // Assume there might be a 'value' or 'deal_value' in custom_fields
            const val = parseFloat((lead.custom_fields as any)?.value || (lead.custom_fields as any)?.deal_value || 0);
            return sum + (isNaN(val) ? 0 : val);
        }, 0);

        return {
            wonCount: wonLeads.length,
            revenue
        };
    }

    async getWorkspaceAgentPerformance(workspaceId: string, organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();

        // Activities per agent
        const { data: acts, error: actError } = await supabase
            .from('activities')
            .select('user_id, type, users(name)')
            .eq('workspace_id', workspaceId)
            .eq('organization_id', organizationId);

        if (actError) throw new BadRequestException(actError.message);

        // Sales per agent
        const { data: leads, error: leadError } = await supabase
            .from('leads')
            .select('assignee_id, status')
            .eq('workspace_id', workspaceId)
            .eq('organization_id', organizationId);

        if (leadError) throw new BadRequestException(leadError.message);

        const performance = acts.reduce((acc: Record<string, any>, act) => {
            const userId = act.user_id;
            if (!acc[userId]) {
                acc[userId] = {
                    userId,
                    name: (act.users as any)?.name || 'Unknown',
                    calls: 0,
                    whatsapp: 0,
                    emails: 0,
                    notes: 0,
                    sales: 0
                };
            }
            if (act.type === 'call') acc[userId].calls++;
            else if (act.type === 'whatsapp') acc[userId].whatsapp++;
            else if (act.type === 'email') acc[userId].emails++;
            else if (act.type === 'note') acc[userId].notes++;
            return acc;
        }, {});

        for (const lead of leads) {
            if (lead.status === 'Won' && lead.assignee_id && performance[lead.assignee_id]) {
                performance[lead.assignee_id].sales++;
            }
        }

        return Object.values(performance);
    }

    async getWorkspaceDailyFollowupReport(workspaceId: string, organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const { data, error } = await supabase
            .from('tasks')
            .select('status, due_date')
            .eq('workspace_id', workspaceId)
            .eq('organization_id', organizationId)
            .eq('type', 'CallFollowup')
            .gte('due_date', today.toISOString())
            .lt('due_date', tomorrow.toISOString());

        if (error) throw new BadRequestException(error.message);

        return {
            totalDueToday: data.length,
            completedToday: data.filter(t => t.status === 'Done').length,
            pendingToday: data.filter(t => t.status !== 'Done').length
        };
    }

    async getOrgCombinedAnalytics(organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();

        // Get all workspaces
        const { data: workspaces, error: wsError } = await supabase
            .from('workspaces')
            .select('id, name')
            .eq('organization_id', organizationId);

        if (wsError) throw new BadRequestException(wsError.message);

        // Aggregate stats across all workspaces
        const analytics = await Promise.all(workspaces.map(async (ws) => {
            const { data: leads, error: lError } = await supabase
                .from('leads')
                .select('status')
                .eq('workspace_id', ws.id);

            if (lError) return { workspace: ws.name, total: 0, won: 0 };

            return {
                workspace: ws.name,
                total: leads.length,
                won: leads.filter(l => l.status === 'Won').length
            };
        }));

        return analytics;
    }

    async getOrgRevenueAnalytics(organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from('leads')
            .select('status, custom_fields, updated_at')
            .eq('organization_id', organizationId)
            .eq('status', 'Won')
            .order('updated_at', { ascending: true });

        if (error) throw new BadRequestException(error.message);

        // Group by month
        const revenueByMonth = data.reduce((acc: Record<string, number>, lead) => {
            const date = new Date(lead.updated_at);
            const month = date.toLocaleString('default', { month: 'short', year: 'numeric' });
            const val = parseFloat((lead.custom_fields as any)?.value || (lead.custom_fields as any)?.deal_value || 0);
            acc[month] = (acc[month] || 0) + (isNaN(val) ? 0 : val);
            return acc;
        }, {});

        return Object.entries(revenueByMonth).map(([month, revenue]) => ({ month, revenue }));
    }

    async getOrgUserActivityLogs(organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();
        // Since there's no audit_logs table, we use activities as a proxy for user engagement
        const { data, error } = await supabase
            .from('activities')
            .select('*, users(name), leads(name)')
            .eq('organization_id', organizationId)
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) throw new BadRequestException(error.message);

        return data.map(act => ({
            id: act.id,
            timestamp: act.created_at,
            user: (act.users as any)?.name || 'Unknown',
            action: act.type,
            details: act.title,
            lead: (act.leads as any)?.name || 'N/A'
        }));
    }
}
