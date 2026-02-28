import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    @Get('dashboard')
    @ApiOperation({ summary: 'Get summary stats for dashboard' })
    getDashboard(@CurrentUser() user: any) {
        return this.reportsService.getDashboardStats(user.organizationId, user.id);
    }

    @Get('performance')
    @ApiOperation({ summary: 'Get user performance leaderboard' })
    getPerformance(@CurrentUser() user: any) {
        return this.reportsService.getUserPerformance(user.organizationId);
    }

    @Get('history')
    @ApiOperation({ summary: 'Get history of generated reports' })
    getHistory(@CurrentUser() user: any) {
        return this.reportsService.getReports(user.organizationId);
    }
}
