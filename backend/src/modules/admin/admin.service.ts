import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AdminService {
    private readonly logger = new Logger(AdminService.name);

    constructor(private readonly supabaseService: SupabaseService) { }

    /**
     * Returns a comprehensive stats snapshot for an org's admin dashboard.
     */
    async getOrgStats(organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();

        const [
            usersRes,
            workspacesRes,
            leadsRes,
            tasksRes,
            campaignsRes,
            activitiesRes,
        ] = await Promise.all([
            supabase
                .from('users')
                .select('id, role, status, created_at', { count: 'exact' })
                .eq('organization_id', organizationId),

            supabase
                .from('workspaces')
                .select('id, name, is_default, created_at, members:workspace_members(count)', { count: 'exact' })
                .eq('organization_id', organizationId)
                .order('is_default', { ascending: false }),

            supabase
                .from('leads')
                .select('id, status, created_at', { count: 'exact' })
                .eq('organization_id', organizationId),

            supabase
                .from('tasks')
                .select('id, status, type, created_at', { count: 'exact' })
                .eq('organization_id', organizationId),

            supabase
                .from('campaigns')
                .select('id, status, created_at', { count: 'exact' })
                .eq('organization_id', organizationId),

            supabase
                .from('activities')
                .select('id, type, created_at', { count: 'exact' })
                .eq('organization_id', organizationId)
                .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        ]);

        const users = usersRes.data || [];
        const workspaces = workspacesRes.data || [];
        const leads = leadsRes.data || [];
        const tasks = tasksRes.data || [];
        const campaigns = campaignsRes.data || [];
        const recentActivities = activitiesRes.data || [];

        // User breakdown by role
        const usersByRole = users.reduce((acc, u) => {
            acc[u.role] = (acc[u.role] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // User breakdown by status
        const usersByStatus = users.reduce((acc, u) => {
            acc[u.status || 'Working'] = (acc[u.status || 'Working'] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Lead breakdown by status
        const leadsByStatus = leads.reduce((acc, l) => {
            acc[l.status] = (acc[l.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Task breakdown by status
        const tasksByStatus = tasks.reduce((acc, t) => {
            acc[t.status] = (acc[t.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // New leads in last 7 days
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const newLeadsThisWeek = leads.filter(l => new Date(l.created_at) >= sevenDaysAgo).length;
        const newUsersThisWeek = users.filter(u => new Date(u.created_at) >= sevenDaysAgo).length;

        // Campaign counts by status
        const activeCampaigns = campaigns.filter(c => c.status === 'active').length;

        return {
            overview: {
                totalUsers: users.length,
                totalWorkspaces: workspaces.length,
                totalLeads: leads.length,
                totalTasks: tasks.length,
                totalCampaigns: campaigns.length,
                activeCampaigns,
                callsThisWeek: recentActivities.filter(a => a.type === 'call').length,
                newLeadsThisWeek,
                newUsersThisWeek,
            },
            users: {
                total: users.length,
                byRole: usersByRole,
                byStatus: usersByStatus,
            },
            leads: {
                total: leads.length,
                newThisWeek: newLeadsThisWeek,
                byStatus: leadsByStatus,
            },
            tasks: {
                total: tasks.length,
                byStatus: tasksByStatus,
                pending: tasksByStatus['pending'] || 0,
                completed: tasksByStatus['completed'] || 0,
            },
            workspaces: workspaces.map(w => ({
                id: w.id,
                name: w.name,
                isDefault: w.is_default,
                memberCount: (w.members as any)?.[0]?.count || 0,
                createdAt: w.created_at,
            })),
            recentActivity: {
                last7DaysCalls: activitiesRes.count || 0,
            },
        };
    }

    /**
     * Returns all users across the organization with full details.
     */
    async getOrgUsers(organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from('users')
            .select('id, name, email, phone, role, status, license_type, license_expiry, created_at')
            .eq('organization_id', organizationId)
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        return data;
    }

    /**
     * Update a user's role within the organization.
     */
    async updateUserRole(targetUserId: string, role: string, organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();

        // Only update if user belongs to this org
        const { data, error } = await supabase
            .from('users')
            .update({ role })
            .eq('id', targetUserId)
            .eq('organization_id', organizationId)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    /**
     * Returns audit log of recent activities (calls, notes) org-wide.
     */
    async getRecentActivity(organizationId: string, limit = 20) {
        const supabase = this.supabaseService.getAdminClient();

        // activities schema: id, organization_id, lead_id, user_id, type, details (JSONB), created_at
        // 'outcome' and 'notes' live inside details JSON, not as stand-alone columns
        const { data, error } = await supabase
            .from('activities')
            .select('id, type, details, created_at, user:users(name, email), lead:leads(name, phone)')
            .eq('organization_id', organizationId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (!error) return data || [];

        // Fallback: simple query without joins if schema/FK issue
        this.logger.warn(`Activity join query failed (${error.message}). Falling back to simple query.`);
        const { data: fallback } = await supabase
            .from('activities')
            .select('id, type, details, created_at')
            .eq('organization_id', organizationId)
            .order('created_at', { ascending: false })
            .limit(limit);

        return fallback || [];
    }
}
