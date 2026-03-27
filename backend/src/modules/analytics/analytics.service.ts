import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export interface AnalyticsTimeRange {
  start: Date;
  end: Date;
  type: 'day' | 'week' | 'month' | 'quarter' | 'year';
}

export interface AnalyticsMetrics {
  leads: {
    total: number;
    new: number;
    conversion_rate: number;
    by_source: Record<string, number>;
    by_status: Record<string, number>;
    by_assignee: Record<string, number>;
  };
  calls: {
    total: number;
    connected: number;
    missed: number;
    avg_duration: number;
    connection_rate: number;
    by_agent: Record<string, any>;
    by_hour: Record<string, number>;
  };
  whatsapp: {
    total_messages: number;
    sent: number;
    received: number;
    delivery_rate: number;
    read_rate: number;
    by_type: Record<string, number>;
  };
  revenue: {
    total_deals: number;
    total_value: number;
    avg_deal_value: number;
    conversion_funnel: Record<string, number>;
  };
  activities: {
    total: number;
    by_type: Record<string, number>;
    by_user: Record<string, number>;
    completion_rate: number;
  };
}

export interface DashboardData {
  metrics: AnalyticsMetrics;
  trends: {
    leads: Array<{ date: string; count: number }>;
    calls: Array<{ date: string; count: number }>;
    conversions: Array<{ date: string; rate: number }>;
    revenue: Array<{ date: string; amount: number }>;
  };
  topPerformers: {
    agents: Array<{ name: string; score: number; leads: number; calls: number }>;
    sources: Array<{ name: string; count: number; conversion_rate: number }>;
  };
  alerts: Array<{
    type: 'warning' | 'error' | 'info';
    title: string;
    description: string;
    metric: string;
    value: number;
    threshold: number;
  }>;
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async getDashboardData(
    organizationId: string,
    workspaceId: string,
    timeRange: AnalyticsTimeRange
  ): Promise<DashboardData> {
    try {
      const [metrics, trends, topPerformers, alerts] = await Promise.all([
        this.getMetrics(organizationId, workspaceId, timeRange),
        this.getTrends(organizationId, workspaceId, timeRange),
        this.getTopPerformers(organizationId, workspaceId, timeRange),
        this.getAlerts(organizationId, workspaceId, timeRange),
      ]);

      return {
        metrics,
        trends,
        topPerformers,
        alerts,
      };
    } catch (error) {
      this.logger.error('Error getting dashboard data:', error);
      throw new BadRequestException('Failed to get dashboard data');
    }
  }

  async getMetrics(
    organizationId: string,
    workspaceId: string,
    timeRange: AnalyticsTimeRange
  ): Promise<AnalyticsMetrics> {
    const supabase = this.supabaseService.getAdminClient();

    const [leadsMetrics, callsMetrics, whatsappMetrics, activitiesMetrics] = await Promise.all([
      this.getLeadsMetrics(supabase, workspaceId, timeRange),
      this.getCallsMetrics(supabase, workspaceId, timeRange),
      this.getWhatsAppMetrics(supabase, workspaceId, timeRange),
      this.getActivitiesMetrics(supabase, workspaceId, timeRange),
    ]);

    const revenueMetrics = await this.getRevenueMetrics(supabase, workspaceId, timeRange);

    return {
      leads: leadsMetrics,
      calls: callsMetrics,
      whatsapp: whatsappMetrics,
      revenue: revenueMetrics,
      activities: activitiesMetrics,
    };
  }

  async getTrends(
    organizationId: string,
    workspaceId: string,
    timeRange: AnalyticsTimeRange
  ) {
    const supabase = this.supabaseService.getAdminClient();

    const [leadsTrend, callsTrend, revenueTrend] = await Promise.all([
      this.getLeadsTrend(supabase, workspaceId, timeRange),
      this.getCallsTrend(supabase, workspaceId, timeRange),
      this.getRevenueTrend(supabase, workspaceId, timeRange),
    ]);

    // Calculate conversions trend based on leads and status
    const conversionsTrend = leadsTrend.map((l, i) => ({
      date: l.date,
      rate: leadsTrend[i].count > 0 ? Math.round((l.count / 10) * 100) / 100 : 0, // Placeholder calculation
    }));

    return {
      leads: leadsTrend,
      calls: callsTrend,
      conversions: conversionsTrend,
      revenue: revenueTrend,
    };
  }

  async getCustomReport(
    organizationId: string,
    workspaceId: string,
    reportConfig: {
      metrics: string[];
      groupBy?: string;
      filters?: Record<string, any>;
      timeRange: AnalyticsTimeRange;
    }
  ) {
    const supabase = this.supabaseService.getAdminClient();
    
    // Build dynamic query based on report configuration
    const data = await this.buildCustomQuery(supabase, workspaceId, reportConfig);
    
    return {
      data,
      config: reportConfig,
      generatedAt: new Date().toISOString(),
    };
  }

  async getRealTimeMetrics(workspaceId: string) {
    const supabase = this.supabaseService.getAdminClient();
    
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const [
      todayLeads,
      activeCalls,
      unreadMessages,
      pendingTasks,
      onlineUsers,
    ] = await Promise.all([
      this.getTodayLeads(supabase, workspaceId, todayStart),
      this.getActiveCalls(supabase, workspaceId),
      this.getUnreadMessages(supabase, workspaceId),
      this.getPendingTasks(supabase, workspaceId),
      this.getOnlineUsers(supabase, workspaceId),
    ]);

    return {
      leads: {
        today: todayLeads,
        thisHour: await this.getHourLeads(supabase, workspaceId, now),
      },
      calls: {
        active: activeCalls,
        today: await this.getTodayCalls(supabase, workspaceId, todayStart),
      },
      messages: {
        unread: unreadMessages,
        today: await this.getTodayMessages(supabase, workspaceId, todayStart),
      },
      tasks: {
        pending: pendingTasks,
        overdue: await this.getOverdueTasks(supabase, workspaceId),
      },
      users: {
        online: onlineUsers,
        total: await this.getTotalUsers(supabase, workspaceId),
      },
      timestamp: now.toISOString(),
    };
  }

  async getConversionFunnel(workspaceId: string, timeRange: AnalyticsTimeRange) {
    const supabase = this.supabaseService.getAdminClient();

    const stages = ['fresh', 'contacted', 'interested', 'qualified', 'proposal', 'negotiation', 'won'];
    const funnel: Record<string, number> = {};
    const conversionRates: Record<string, number> = {};
    
    for (const stage of stages) {
      const { count } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('workspace_id', workspaceId)
        .eq('status', stage)
        .gte('created_at', timeRange.start.toISOString())
        .lte('created_at', timeRange.end.toISOString());

      funnel[stage] = count || 0;
    }

    // Calculate conversion rates between stages
    let previousCount = funnel[stages[0]] || 1;
    for (let i = 1; i < stages.length; i++) {
      const currentCount = funnel[stages[i]] || 0;
      conversionRates[`${stages[i-1]}_to_${stages[i]}`] = previousCount > 0 
        ? Math.round((currentCount / previousCount) * 100) 
        : 0;
      previousCount = currentCount;
    }

    return {
      funnel,
      conversionRates,
      totalLeads: Object.values(funnel).reduce((sum: number, count: number) => sum + count, 0),
    };
  }

  async getAgentPerformance(workspaceId: string, timeRange: AnalyticsTimeRange) {
    const supabase = this.supabaseService.getAdminClient();

    // Fetch users (agents) in the workspace
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('workspace_id', workspaceId);

    if (userError) throw userError;

    // Fetch leads for these users in the time range
    const { data: leads, error: leadError } = await supabase
      .from('leads')
      .select('id, status, created_at, custom_fields, assignee_id')
      .eq('workspace_id', workspaceId)
      .gte('created_at', timeRange.start.toISOString())
      .lte('created_at', timeRange.end.toISOString());

    if (leadError) throw leadError;

    // Fetch activities (calls) for these users in the time range
    const { data: activities, error: actError } = await supabase
      .from('activities')
      .select('id, type, details, user_id, created_at')
      .eq('workspace_id', workspaceId)
      .gte('created_at', timeRange.start.toISOString())
      .lte('created_at', timeRange.end.toISOString());

    if (actError) throw actError;

    const performance = users.map(user => {
      const userLeads = leads?.filter(l => l.assignee_id === user.id) || [];
      const userCalls = activities?.filter(a => a.user_id === user.id && a.type === 'call') || [];
      const userActivities = activities?.filter(a => a.user_id === user.id) || [];

      const totalLeads = userLeads.length;
      const wonLeads = userLeads.filter(l => l.status?.toLowerCase() === 'won').length;
      
      const totalCalls = userCalls.length;
      const connectedCalls = userCalls.filter(c => {
        const details = typeof c.details === 'string' ? JSON.parse(c.details) : c.details;
        return details?.status === 'connected' || details?.outcome === 'Connected';
      }).length;

      const totalCallDuration = userCalls.reduce((sum, c) => {
        const details = typeof c.details === 'string' ? JSON.parse(c.details) : c.details;
        return sum + (parseInt(details?.duration) || 0);
      }, 0);

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        metrics: {
          leads: {
            total: totalLeads,
            won: wonLeads,
            conversionRate: totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0,
          },
          calls: {
            total: totalCalls,
            connected: connectedCalls,
            connectionRate: totalCalls > 0 ? Math.round((connectedCalls / totalCalls) * 100) : 0,
            avgDuration: connectedCalls > 0 ? Math.round(totalCallDuration / connectedCalls) : 0,
          },
          activities: {
            total: userActivities.length,
            completed: userActivities.filter(a => a.type === 'completed').length,
          },
        },
        score: this.calculatePerformanceScore({
          leadConversion: totalLeads > 0 ? (wonLeads / totalLeads) : 0,
          callConnection: totalCalls > 0 ? (connectedCalls / totalCalls) : 0,
          activityCount: userActivities.length,
        }),
      };
    });

    return performance.sort((a, b) => b.score - a.score);
  }

  private async getLeadsMetrics(supabase: any, workspaceId: string, timeRange: AnalyticsTimeRange) {
    const { data: leads, error } = await supabase
      .from('leads')
      .select('status, source, assignee_id, custom_fields, created_at')
      .eq('workspace_id', workspaceId)
      .gte('created_at', timeRange.start.toISOString())
      .lte('created_at', timeRange.end.toISOString());

    if (error) throw error;

    const total = leads?.length || 0;
    const newLeads = leads?.filter((l: any) => l.status?.toLowerCase() === 'fresh').length || 0;
    const wonLeads = leads?.filter((l: any) => l.status?.toLowerCase() === 'won').length || 0;

    const bySource = leads?.reduce((acc: Record<string, number>, lead: any) => {
      acc[lead.source || 'unknown'] = (acc[lead.source || 'unknown'] || 0) + 1;
      return acc;
    }, {}) || {};

    const byStatus = leads?.reduce((acc: Record<string, number>, lead: any) => {
      acc[lead.status || 'unknown'] = (acc[lead.status || 'unknown'] || 0) + 1;
      return acc;
    }, {}) || {};

    const byAssignee = leads?.reduce((acc: Record<string, number>, lead: any) => {
      if (lead.assignee_id) {
        acc[lead.assignee_id] = (acc[lead.assignee_id] || 0) + 1;
      }
      return acc;
    }, {}) || {};

    return {
      total,
      new: newLeads,
      conversion_rate: total > 0 ? Math.round((wonLeads / total) * 100) : 0,
      by_source: bySource,
      by_status: byStatus,
      by_assignee: byAssignee,
    };
  }

  private async getCallsMetrics(supabase: any, workspaceId: string, timeRange: AnalyticsTimeRange) {
    // Queries activities table with type = 'call'
    const { data: activities, error } = await supabase
      .from('activities')
      .select('details, user_id, created_at')
      .eq('workspace_id', workspaceId)
      .eq('type', 'call')
      .gte('created_at', timeRange.start.toISOString())
      .lte('created_at', timeRange.end.toISOString());

    if (error) throw error;

    const total = activities?.length || 0;
    // Map details JSON to status/duration if available
    const connected = activities?.filter((a: any) => {
      const details = typeof a.details === 'string' ? JSON.parse(a.details) : a.details;
      return details?.status === 'connected' || details?.outcome === 'Connected';
    }).length || 0;
    
    const missed = activities?.filter((a: any) => {
      const details = typeof a.details === 'string' ? JSON.parse(a.details) : a.details;
      return details?.status === 'missed' || details?.outcome === 'Missed';
    }).length || 0;

    const totalDuration = activities?.reduce((sum: number, a: any) => {
      const details = typeof a.details === 'string' ? JSON.parse(a.details) : a.details;
      return sum + (parseInt(details?.duration) || 0);
    }, 0) || 0;

    const byAgent = activities?.reduce((acc: Record<string, any>, activity: any) => {
      const agentId = activity.user_id || 'unassigned';
      const details = typeof activity.details === 'string' ? JSON.parse(activity.details) : activity.details;
      if (!acc[agentId]) {
        acc[agentId] = { total: 0, connected: 0, duration: 0 };
      }
      acc[agentId].total++;
      if (details?.status === 'connected' || details?.outcome === 'Connected') {
        acc[agentId].connected++;
        acc[agentId].duration += parseInt(details?.duration) || 0;
      }
      return acc;
    }, {}) || {};

    const byHour = activities?.reduce((acc: Record<string, number>, activity: any) => {
      const hour = new Date(activity.created_at).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {}) || {};

    return {
      total,
      connected,
      missed,
      avg_duration: connected > 0 ? Math.round(totalDuration / connected) : 0,
      connection_rate: total > 0 ? Math.round((connected / total) * 100) : 0,
      by_agent: byAgent,
      by_hour: byHour,
    };
  }

  private async getWhatsAppMetrics(supabase: any, workspaceId: string, timeRange: AnalyticsTimeRange) {
    // Queries activities table with type = 'whatsapp'
    const { data: activities, error } = await supabase
      .from('activities')
      .select('type, details, created_at')
      .eq('workspace_id', workspaceId)
      .eq('type', 'whatsapp')
      .gte('created_at', timeRange.start.toISOString())
      .lte('created_at', timeRange.end.toISOString());

    if (error) throw error;

    const total = activities?.length || 0;
    const sent = activities?.filter((a: any) => {
      const details = typeof a.details === 'string' ? JSON.parse(a.details) : a.details;
      return details?.direction === 'outbound' || details?.type === 'sent';
    }).length || 0;
    
    const received = activities?.filter((a: any) => {
      const details = typeof a.details === 'string' ? JSON.parse(a.details) : a.details;
      return details?.direction === 'inbound' || details?.type === 'received';
    }).length || 0;

    const delivered = activities?.filter((a: any) => {
      const details = typeof a.details === 'string' ? JSON.parse(a.details) : a.details;
      return details?.status === 'delivered';
    }).length || 0;

    const read = activities?.filter((a: any) => {
      const details = typeof a.details === 'string' ? JSON.parse(a.details) : a.details;
      return details?.status === 'read';
    }).length || 0;

    const byType = activities?.reduce((acc: Record<string, number>, activity: any) => {
      const details = typeof activity.details === 'string' ? JSON.parse(activity.details) : activity.details;
      acc[details?.type || 'text'] = (acc[details?.type || 'text'] || 0) + 1;
      return acc;
    }, {}) || {};

    return {
      total_messages: total,
      sent,
      received,
      delivery_rate: sent > 0 ? Math.round((delivered / sent) * 100) : 0,
      read_rate: delivered > 0 ? Math.round((read / delivered) * 100) : 0,
      by_type: byType,
    };
  }

  private async getRevenueMetrics(supabase: any, workspaceId: string, timeRange: AnalyticsTimeRange) {
    const { data: deals, error } = await supabase
      .from('leads')
      .select('status, custom_fields, created_at')
      .eq('workspace_id', workspaceId)
      .eq('status', 'won')
      .gte('created_at', timeRange.start.toISOString())
      .lte('created_at', timeRange.end.toISOString());

    if (error) throw error;

    const totalDeals = deals?.length || 0;
    const totalValue = deals?.reduce((sum: number, deal: any) => {
      const val = parseFloat(deal.custom_fields?.deal_value || deal.custom_fields?.value || 0);
      return sum + (isNaN(val) ? 0 : val);
    }, 0) || 0;

    return {
      total_deals: totalDeals,
      total_value: totalValue,
      avg_deal_value: totalDeals > 0 ? Math.round(totalValue / totalDeals) : 0,
      conversion_funnel: {}, // Will be populated separately
    };
  }

  private async getActivitiesMetrics(supabase: any, workspaceId: string, timeRange: AnalyticsTimeRange) {
    const { data: activities, error } = await supabase
      .from('activities')
      .select('type, user_id, created_at')
      .eq('workspace_id', workspaceId)
      .gte('created_at', timeRange.start.toISOString())
      .lte('created_at', timeRange.end.toISOString());

    if (error) throw error;

    const total = activities?.length || 0;

    const byType = activities?.reduce((acc: Record<string, number>, activity: any) => {
      acc[activity.type || 'unknown'] = (acc[activity.type || 'unknown'] || 0) + 1;
      return acc;
    }, {}) || {};

    const byUser = activities?.reduce((acc: Record<string, number>, activity: any) => {
      const userId = activity.user_id || 'unassigned';
      acc[userId] = (acc[userId] || 0) + 1;
      return acc;
    }, {}) || {};

    return {
      total,
      by_type: byType,
      by_user: byUser,
      completion_rate: 85, // Placeholder - calculate based on completed vs total
    };
  }

  private calculatePerformanceScore(metrics: {
    leadConversion: number;
    callConnection: number;
    activityCount: number;
  }): number {
    const leadScore = metrics.leadConversion * 40;
    const callScore = metrics.callConnection * 35;
    const activityScore = Math.min(metrics.activityCount * 2, 25);
    
    return Math.round(leadScore + callScore + activityScore);
  }

  // Helper methods for real-time metrics
  private async getTodayLeads(supabase: any, workspaceId: string, todayStart: Date) {
    const { count } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId)
      .gte('created_at', todayStart.toISOString());
    return count || 0;
  }

  private async getActiveCalls(supabase: any, workspaceId: string) {
    const { count } = await supabase
      .from('activities')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId)
      .eq('type', 'call')
      .filter('details->>status', 'in', '("initiated","connected")');
    return count || 0;
  }

  private async getUnreadMessages(supabase: any, workspaceId: string) {
    // Fallback: Using activities as proxy or returning 0 if no specific unread table exists
    return 0;
  }

  private async getPendingTasks(supabase: any, workspaceId: string) {
    const { count } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId)
      .in('status', ['pending', 'In Progress']);
    return count || 0;
  }

  private async getOnlineUsers(supabase: any, workspaceId: string) {
    // Placeholder
    return 1;
  }

  private async getHourLeads(supabase: any, workspaceId: string, now: Date) {
    const hourStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());
    const { count } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId)
      .gte('created_at', hourStart.toISOString());
    return count || 0;
  }

  private async getTodayCalls(supabase: any, workspaceId: string, todayStart: Date) {
    const { count } = await supabase
      .from('activities')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId)
      .eq('type', 'call')
      .gte('created_at', todayStart.toISOString());
    return count || 0;
  }

  private async getTodayMessages(supabase: any, workspaceId: string, todayStart: Date) {
    const { count } = await supabase
      .from('activities')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId)
      .eq('type', 'whatsapp')
      .gte('created_at', todayStart.toISOString());
    return count || 0;
  }

  private async getOverdueTasks(supabase: any, workspaceId: string) {
    const { count } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId)
      .eq('status', 'Overdue');
    return count || 0;
  }

  private async getTotalUsers(supabase: any, workspaceId: string) {
    const { count } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId);
    return count || 0;
  }

  // Additional helper methods for trends and top performers
  private async getLeadsTrend(supabase: any, workspaceId: string, timeRange: AnalyticsTimeRange) {
    const { data, error } = await supabase
      .from('leads')
      .select('created_at')
      .eq('workspace_id', workspaceId)
      .gte('created_at', timeRange.start.toISOString())
      .lte('created_at', timeRange.end.toISOString());

    if (error) return [];

    const trend = data.reduce((acc: Record<string, number>, lead: any) => {
      const date = new Date(lead.created_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(trend).map(([date, count]) => ({ date, count: count as number })).sort((a, b) => a.date.localeCompare(b.date));
  }

  private async getCallsTrend(supabase: any, workspaceId: string, timeRange: AnalyticsTimeRange) {
    const { data, error } = await supabase
      .from('activities')
      .select('created_at')
      .eq('workspace_id', workspaceId)
      .eq('type', 'call')
      .gte('created_at', timeRange.start.toISOString())
      .lte('created_at', timeRange.end.toISOString());

    if (error) return [];

    const trend = data.reduce((acc: Record<string, number>, act: any) => {
      const date = new Date(act.created_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(trend).map(([date, count]) => ({ date, count: count as number })).sort((a, b) => a.date.localeCompare(b.date));
  }

  private async getRevenueTrend(supabase: any, workspaceId: string, timeRange: AnalyticsTimeRange) {
    const { data, error } = await supabase
      .from('leads')
      .select('created_at, custom_fields')
      .eq('workspace_id', workspaceId)
      .eq('status', 'won')
      .gte('created_at', timeRange.start.toISOString())
      .lte('created_at', timeRange.end.toISOString());

    if (error) return [];

    const trend = data.reduce((acc: Record<string, number>, lead: any) => {
      const date = new Date(lead.created_at).toISOString().split('T')[0];
      const val = parseFloat(lead.custom_fields?.deal_value || lead.custom_fields?.value || 0);
      acc[date] = (acc[date] || 0) + (isNaN(val) ? 0 : val);
      return acc;
    }, {});

    return Object.entries(trend).map(([date, amount]) => ({ date, amount: amount as number })).sort((a, b) => a.date.localeCompare(b.date));
  }

  private async getTopPerformers(organizationId: string, workspaceId: string, timeRange: AnalyticsTimeRange) {
    const performance = await this.getAgentPerformance(workspaceId, timeRange);
    
    // Aggregate by Source
    const supabase = this.supabaseService.getAdminClient();
    const { data: leads } = await supabase
      .from('leads')
      .select('source, status')
      .eq('workspace_id', workspaceId)
      .gte('created_at', timeRange.start.toISOString());

    const sourceStats = leads?.reduce((acc: Record<string, any>, lead: any) => {
      const source = lead.source || 'Unknown';
      if (!acc[source]) acc[source] = { name: source, count: 0, won: 0 };
      acc[source].count++;
      if (lead.status?.toLowerCase() === 'won') acc[source].won++;
      return acc;
    }, {}) || {};

    const topSources = Object.values(sourceStats).map((s: any) => ({
      name: s.name,
      count: s.count,
      conversion_rate: s.count > 0 ? Math.round((s.won / s.count) * 100) : 0
    })).sort((a, b) => b.count - a.count);

    return {
      agents: performance.slice(0, 5).map(p => ({
        name: p.name,
        score: p.score,
        leads: p.metrics.leads.total,
        calls: p.metrics.calls.total,
      })),
      sources: topSources.slice(0, 5),
    };
  }

  private async getAlerts(organizationId: string, workspaceId: string, timeRange: AnalyticsTimeRange) {
    // Implementation for analytics alerts
    return [];
  }

  private async buildCustomQuery(supabase: any, workspaceId: string, reportConfig: any) {
    // Implementation for dynamic query building
    return [];
  }
}
