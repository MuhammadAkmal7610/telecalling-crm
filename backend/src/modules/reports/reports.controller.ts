import { Controller, Get, UseGuards, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiQuery } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
@Roles('manager', 'admin', 'billing_admin', 'root')
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    @Get('dashboard')
    @ApiOperation({ summary: 'Get summary stats for dashboard' })
    @ApiQuery({ name: 'timeRange', required: false, example: '7d' })
    getDashboard(
        @CurrentUser() user: any,
        @Query('timeRange') timeRange?: string
    ) {
        return this.reportsService.getDashboardStats(user.organizationId, user.id, user.workspaceId, timeRange || '7d');
    }

    @Get('pipeline-conversion')
    @ApiOperation({ summary: 'Get pipeline conversion analytics' })
    @ApiQuery({ name: 'timeRange', required: false, example: '30d' })
    getPipelineConversion(
        @CurrentUser() user: any,
        @Query('timeRange') timeRange?: string
    ) {
        return this.reportsService.getPipelineConversionRate(user.workspaceId, user.organizationId, timeRange || '30d');
    }

    @Get('performance')
    @ApiOperation({ summary: 'Get user performance leaderboard' })
    getPerformance(@CurrentUser() user: any) {
        return this.reportsService.getUserPerformance(user.organizationId);
    }

    // --- Workspace Reports ---

    @Get('workspace/:id/source')
    @ApiOperation({ summary: 'Leads by source for a workspace' })
    getWorkspaceSource(@Param('id') workspaceId: string, @CurrentUser() user: any) {
        return this.reportsService.getWorkspaceLeadsBySource(workspaceId, user.organizationId);
    }

    @Get('workspace/:id/conversion')
    @ApiOperation({ summary: 'Conversion rate for a workspace' })
    getWorkspaceConversion(@Param('id') workspaceId: string, @CurrentUser() user: any) {
        return this.reportsService.getWorkspaceConversionRate(workspaceId, user.organizationId);
    }

    @Get('workspace/:id/sales')
    @ApiOperation({ summary: 'Sales performance for a workspace' })
    getWorkspaceSales(@Param('id') workspaceId: string, @CurrentUser() user: any) {
        return this.reportsService.getWorkspaceSalesPerformance(workspaceId, user.organizationId);
    }

    @Get('workspace/:id/agents')
    @ApiOperation({ summary: 'Agent performance for a workspace' })
    getWorkspaceAgents(@Param('id') workspaceId: string, @CurrentUser() user: any) {
        return this.reportsService.getWorkspaceAgentPerformance(workspaceId, user.organizationId);
    }

    @Get('workspace/:id/followups')
    @ApiOperation({ summary: 'Daily follow-up report for a workspace' })
    getWorkspaceFollowups(@Param('id') workspaceId: string, @CurrentUser() user: any) {
        return this.reportsService.getWorkspaceDailyFollowupReport(workspaceId, user.organizationId);
    }

    // --- Organization Reports ---

    @Get('org/analytics')
    @ApiOperation({ summary: 'Combined workspace analytics for organization' })
    @Roles('admin', 'root')
    getOrgAnalytics(@CurrentUser() user: any) {
        return this.reportsService.getOrgCombinedAnalytics(user.organizationId);
    }

    @Get('org/revenue')
    @ApiOperation({ summary: 'Revenue analytics for organization' })
    @Roles('admin', 'root', 'billing_admin')
    getOrgRevenue(@CurrentUser() user: any) {
        return this.reportsService.getOrgRevenueAnalytics(user.organizationId);
    }

    @Get('org/activities')
    @ApiOperation({ summary: 'User activity logs for organization' })
    @Roles('admin', 'root')
    getOrgActivities(@CurrentUser() user: any) {
        return this.reportsService.getOrgUserActivityLogs(user.organizationId);
    }
}
