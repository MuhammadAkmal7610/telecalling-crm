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

    const [leadsTrend, callsTrend, conversionsTrend, revenueTrend] = await Promise.all([
      this.getLeadsTrend(supabase, workspaceId, timeRange),
      this.getCallsTrend(supabase, workspaceId, timeRange),
      this.getConversionsTrend(supabase, workspaceId, timeRange),
      this.getRevenueTrend(supabase, workspaceId, timeRange),
    ]);

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

    const { data: agents, error } = await supabase
      .from('users')
      .select(`
        id,
        name,
        email,
        leads:leads(id, status, created_at, value),
        calls:calls(id, status, duration, started_at),
        activities:activities(id, type, created_at)
      `)
      .eq('workspace_id', workspaceId)
      .in('role', ['agent', 'manager', 'admin']);

    if (error) throw error;

    const performance = agents.map(agent => {
      const leads = agent.leads || [];
      const calls = agent.calls || [];
      const activities = agent.activities || [];

      const totalLeads = leads.length;
      const wonLeads = leads.filter(l => l.status === 'won').length;
      const totalCalls = calls.length;
      const connectedCalls = calls.filter(c => c.status === 'connected').length;
      const totalCallDuration = calls.reduce((sum, c) => sum + (c.duration || 0), 0);

      return {
        id: agent.id,
        name: agent.name,
        email: agent.email,
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
            total: activities.length,
            completed: activities.filter(a => a.type === 'completed').length,
          },
        },
        score: this.calculatePerformanceScore({
          leadConversion: totalLeads > 0 ? (wonLeads / totalLeads) : 0,
          callConnection: totalCalls > 0 ? (connectedCalls / totalCalls) : 0,
          activityCount: activities.length,
        }),
      };
    });

    return performance.sort((a, b) => b.score - a.score);
  }

  private async getLeadsMetrics(supabase: any, workspaceId: string, timeRange: AnalyticsTimeRange) {
    const { data: leads, error } = await supabase
      .from('leads')
      .select('status, source, assignee_id, value, created_at')
      .eq('workspace_id', workspaceId)
      .gte('created_at', timeRange.start.toISOString())
      .lte('created_at', timeRange.end.toISOString());

    if (error) throw error;

    const total = leads?.length || 0;
    const newLeads = leads?.filter((l: any) => l.status === 'fresh').length || 0;
    const wonLeads = leads?.filter((l: any) => l.status === 'won').length || 0;

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
    const { data: calls, error } = await supabase
      .from('calls')
      .select('status, duration, agent_id, started_at')
      .eq('workspace_id', workspaceId)
      .gte('started_at', timeRange.start.toISOString())
      .lte('started_at', timeRange.end.toISOString());

    if (error) throw error;

    const total = calls?.length || 0;
    const connected = calls?.filter((c: any) => c.status === 'connected').length || 0;
    const missed = calls?.filter((c: any) => c.status === 'missed').length || 0;
    const totalDuration = calls?.reduce((sum: number, c: any) => sum + (c.duration || 0), 0) || 0;

    const byAgent = calls?.reduce((acc: Record<string, any>, call: any) => {
      const agentId = call.agent_id || 'unassigned';
      if (!acc[agentId]) {
        acc[agentId] = { total: 0, connected: 0, duration: 0 };
      }
      acc[agentId].total++;
      if (call.status === 'connected') {
        acc[agentId].connected++;
        acc[agentId].duration += call.duration || 0;
      }
      return acc;
    }, {}) || {};

    const byHour = calls?.reduce((acc: Record<string, number>, call: any) => {
      const hour = new Date(call.started_at).getHours();
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
    const { data: messages, error } = await supabase
      .from('whatsapp_messages')
      .select('status, type, created_at')
      .eq('workspace_id', workspaceId)
      .gte('created_at', timeRange.start.toISOString())
      .lte('created_at', timeRange.end.toISOString());

    if (error) throw error;

    const total = messages?.length || 0;
    const sent = messages?.filter((m: any) => m.status === 'sent').length || 0;
    const received = messages?.filter((m: any) => m.status === 'received').length || 0;
    const delivered = messages?.filter((m: any) => m.status === 'delivered').length || 0;
    const read = messages?.filter((m: any) => m.status === 'read').length || 0;

    const byType = messages?.reduce((acc: Record<string, number>, message: any) => {
      acc[message.type || 'text'] = (acc[message.type || 'text'] || 0) + 1;
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
      .select('status, value, created_at')
      .eq('workspace_id', workspaceId)
      .eq('status', 'won')
      .gte('created_at', timeRange.start.toISOString())
      .lte('created_at', timeRange.end.toISOString());

    if (error) throw error;

    const totalDeals = deals?.length || 0;
    const totalValue = deals?.reduce((sum: number, deal: any) => sum + (deal.value || 0), 0) || 0;

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
      .from('calls')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId)
      .in('status', ['initiated', 'connected']);
    return count || 0;
  }

  private async getUnreadMessages(supabase: any, workspaceId: string) {
    const { count } = await supabase
      .from('whatsapp_conversations')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId)
      .gt('unread_count', 0);
    return count || 0;
  }

  private async getPendingTasks(supabase: any, workspaceId: string) {
    const { count } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId)
      .in('status', ['pending', 'overdue']);
    return count || 0;
  }

  private async getOnlineUsers(supabase: any, workspaceId: string) {
    // This would typically integrate with a presence system
    // For now, return a placeholder
    return 5;
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
      .from('calls')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId)
      .gte('started_at', todayStart.toISOString());
    return count || 0;
  }

  private async getTodayMessages(supabase: any, workspaceId: string, todayStart: Date) {
    const { count } = await supabase
      .from('whatsapp_messages')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId)
      .gte('created_at', todayStart.toISOString());
    return count || 0;
  }

  private async getOverdueTasks(supabase: any, workspaceId: string) {
    const { count } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId)
      .eq('status', 'overdue');
    return count || 0;
  }

  private async getTotalUsers(supabase: any, workspaceId: string) {
    const { count } = await supabase
      .from('workspace_members')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId);
    return count || 0;
  }

  // Additional helper methods for trends and top performers
  private async getLeadsTrend(supabase: any, workspaceId: string, timeRange: AnalyticsTimeRange) {
    // Implementation for leads trend over time
    return [];
  }

  private async getCallsTrend(supabase: any, workspaceId: string, timeRange: AnalyticsTimeRange) {
    // Implementation for calls trend over time
    return [];
  }

  private async getConversionsTrend(supabase: any, workspaceId: string, timeRange: AnalyticsTimeRange) {
    // Implementation for conversion rate trend over time
    return [];
  }

  private async getRevenueTrend(supabase: any, workspaceId: string, timeRange: AnalyticsTimeRange) {
    // Implementation for revenue trend over time
    return [];
  }

  private async getTopPerformers(organizationId: string, workspaceId: string, timeRange: AnalyticsTimeRange) {
    const performance = await this.getAgentPerformance(workspaceId, timeRange);
    
    return {
      agents: performance.slice(0, 5).map(p => ({
        name: p.name,
        score: p.score,
        leads: p.metrics.leads.total,
        calls: p.metrics.calls.total,
      })),
      sources: [], // Implementation for top sources
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
