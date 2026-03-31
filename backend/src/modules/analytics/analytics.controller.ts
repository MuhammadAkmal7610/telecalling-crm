import { Controller, Get, Post, Query, Body, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnalyticsService, AnalyticsTimeRange } from './analytics.service';

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get comprehensive dashboard data' })
  async getDashboard(
    @Req() req: any,
    @Query('timeRange') timeRange?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const range = this.parseTimeRange(timeRange, startDate, endDate);
    return this.analyticsService.getDashboardData(
      req.user.organization_id,
      req.user.workspace_id,
      range
    );
  }

  @Get('real-time')
  @ApiOperation({ summary: 'Get real-time metrics' })
  async getRealTimeMetrics(@Req() req: any) {
    return this.analyticsService.getRealTimeMetrics(req.user.workspace_id);
  }

  @Get('conversion-funnel')
  @ApiOperation({ summary: 'Get conversion funnel analysis' })
  async getConversionFunnel(
    @Req() req: any,
    @Query('timeRange') timeRange?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const range = this.parseTimeRange(timeRange, startDate, endDate);
    return this.analyticsService.getConversionFunnel(req.user.workspace_id, range);
  }

  @Get('agent-performance')
  @ApiOperation({ summary: 'Get agent performance metrics' })
  async getAgentPerformance(
    @Req() req: any,
    @Query('timeRange') timeRange?: string
  ) {
    const range = this.parseTimeRange(timeRange);
    return this.analyticsService.getAgentPerformance(
      req.user.workspace_id,
      range
    );
  }

  @Post('custom-report')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate custom report' })
  async generateCustomReport(
    @Req() req: any,
    @Body() reportConfig: any
  ) {
    const range = this.parseTimeRange(
      reportConfig.timeRange?.type || 'week',
      reportConfig.timeRange?.startDate,
      reportConfig.timeRange?.endDate
    );

    return this.analyticsService.getCustomReport(
      req.user.organization_id,
      req.user.workspace_id,
      {
        ...reportConfig,
        timeRange: range,
      }
    );
  }

  @Get('metrics/leads')
  @ApiOperation({ summary: 'Get detailed leads metrics' })
  async getLeadsMetrics(
    @Req() req: any,
    @Query('timeRange') timeRange?: string,
    @Query('groupBy') groupBy?: string
  ) {
    const range = this.parseTimeRange(timeRange);
    const dashboard = await this.analyticsService.getDashboardData(
      req.user.organization_id,
      req.user.workspace_id,
      range
    );
    return dashboard.metrics.leads;
  }

  @Get('metrics/calls')
  @ApiOperation({ summary: 'Get detailed calls metrics' })
  async getCallsMetrics(
    @Req() req: any,
    @Query('timeRange') timeRange?: string,
    @Query('groupBy') groupBy?: string
  ) {
    const range = this.parseTimeRange(timeRange);
    const dashboard = await this.analyticsService.getDashboardData(
      req.user.organization_id,
      req.user.workspace_id,
      range
    );
    return dashboard.metrics.calls;
  }

  @Get('metrics/whatsapp')
  @ApiOperation({ summary: 'Get detailed WhatsApp metrics' })
  async getWhatsAppMetrics(
    @Req() req: any,
    @Query('timeRange') timeRange?: string,
    @Query('groupBy') groupBy?: string
  ) {
    const range = this.parseTimeRange(timeRange);
    const dashboard = await this.analyticsService.getDashboardData(
      req.user.organization_id,
      req.user.workspace_id,
      range
    );
    return dashboard.metrics.whatsapp;
  }

  @Get('trends/leads')
  @ApiOperation({ summary: 'Get leads trend over time' })
  async getLeadsTrend(
    @Query('timeRange') timeRange: string = 'week',
    @Query('granularity') granularity: 'day' | 'week' | 'month' = 'day',
    @Req() req: any
  ) {
    const range = this.parseTimeRange(timeRange);
    const dashboard = await this.analyticsService.getDashboardData(
      req.user.organization_id,
      req.user.workspace_id,
      range
    );
    return dashboard.trends.leads;
  }

  @Get('trends/calls')
  @ApiOperation({ summary: 'Get calls trend over time' })
  async getCallsTrend(
    @Query('timeRange') timeRange: string = 'week',
    @Query('granularity') granularity: 'day' | 'week' | 'month' = 'day',
    @Req() req: any
  ) {
    const range = this.parseTimeRange(timeRange);
    const dashboard = await this.analyticsService.getDashboardData(
      req.user.organization_id,
      req.user.workspace_id,
      range
    );
    return dashboard.trends.calls;
  }

  @Get('trends/conversions')
  @ApiOperation({ summary: 'Get conversion rate trend over time' })
  async getConversionsTrend(
    @Query('timeRange') timeRange: string = 'week',
    @Query('granularity') granularity: 'day' | 'week' | 'month' = 'day',
    @Req() req: any
  ) {
    const range = this.parseTimeRange(timeRange);
    const dashboard = await this.analyticsService.getDashboardData(
      req.user.organization_id,
      req.user.workspace_id,
      range
    );
    return dashboard.trends.conversions;
  }

  @Get('top-performers')
  @ApiOperation({ summary: 'Get top performing agents and sources' })
  async getTopPerformers(
    @Query('timeRange') timeRange: string = 'week',
    @Query('limit') limit: number = 10,
    @Req() req: any
  ) {
    const range = this.parseTimeRange(timeRange);
    const dashboard = await this.analyticsService.getDashboardData(
      req.user.organization_id,
      req.user.workspace_id,
      range
    );
    return dashboard.topPerformers;
  }

  @Get('alerts')
  @ApiOperation({ summary: 'Get analytics alerts and notifications' })
  async getAlerts(
    @Req() req: any,
    @Query('severity') severity?: 'warning' | 'error' | 'info'
  ) {
    const range = this.parseTimeRange('week');
    const dashboard = await this.analyticsService.getDashboardData(
      req.user.organization_id,
      req.user.workspace_id,
      range
    );
    
    let alerts = dashboard.alerts;
    if (severity) {
      alerts = alerts.filter(alert => alert.type === severity);
    }
    
    return alerts;
  }

  private parseTimeRange(
    type: string = 'week',
    startDate?: string,
    endDate?: string
  ): AnalyticsTimeRange {
    const now = new Date();
    let start: Date;
    let end: Date = endDate ? new Date(endDate) : now;

    if (startDate) {
      start = new Date(startDate);
    } else {
      switch (type) {
        case 'day':
          start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          const quarter = Math.floor(now.getMonth() / 3);
          start = new Date(now.getFullYear(), quarter * 3, 1);
          break;
        case 'year':
          start = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }
    }

    return { start, end, type: type as any };
  }
}
