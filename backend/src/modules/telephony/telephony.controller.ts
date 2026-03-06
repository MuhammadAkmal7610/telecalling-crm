import { Controller, Get, Post, Patch, Query, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CreateCallDto, UpdateCallDto } from './telephony.service';
import { TelephonyService } from './telephony.service';

@ApiTags('Telephony')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('telephony')
export class TelephonyController {
    constructor(private readonly telephonyService: TelephonyService) {}

    @Post('calls')
    @ApiOperation({ summary: 'Initiate a new call' })
    async initiateCall(@Body() createCallDto: CreateCallDto, @CurrentUser() user: any) {
        return this.telephonyService.initiateCall(createCallDto, user);
    }

    @Patch('calls/:id')
    @ApiOperation({ summary: 'Update an existing call' })
    async updateCall(
        @Param('id') id: string,
        @Body() updateCallDto: UpdateCallDto,
        @CurrentUser() user: any
    ) {
        return this.telephonyService.updateCall(id, updateCallDto, user.id);
    }

    @Get('calls')
    @ApiOperation({ summary: 'Get calls with filters' })
    async getCalls(
        @Query('agent_id') agentId?: string,
        @Query('lead_id') leadId?: string,
        @Query('status') status?: string,
        @Query('date_from') dateFrom?: string,
        @Query('date_to') dateTo?: string,
        @Query('limit') limit?: number,
        @Query('offset') offset?: number,
        @CurrentUser() user?: any
    ) {
        return this.telephonyService.getCalls({
            workspace_id: user?.workspaceId,
            agent_id: agentId,
            lead_id: leadId,
            status,
            date_from: dateFrom,
            date_to: dateTo,
            limit: limit ? parseInt(limit.toString()) : undefined,
            offset: offset ? parseInt(offset.toString()) : undefined,
        });
    }

    @Get('calls/summary')
    @ApiOperation({ summary: 'Get call summary statistics' })
    async getCallSummary(
        @Query('timeRange') timeRange: string = 'today',
        @CurrentUser() user?: any
    ) {
        return this.telephonyService.getCallSummary(user?.workspaceId, timeRange);
    }

    @Get('calls/analytics')
    @ApiOperation({ summary: 'Get call analytics data' })
    async getCallAnalytics(
        @Query('timeRange') timeRange: string = 'week',
        @CurrentUser() user?: any
    ) {
        return this.telephonyService.getCallAnalytics(user?.workspaceId, timeRange);
    }

    @Get('calls/recordings')
    @ApiOperation({ summary: 'Get call recordings' })
    async getCallRecordings(
        @Query('limit') limit: number = 50,
        @CurrentUser() user?: any
    ) {
        return this.telephonyService.getCallRecordings(user?.workspaceId, limit);
    }

    @Get('leads/next-to-call')
    @ApiOperation({ summary: 'Get next lead to call' })
    async getNextLeadToCall(@CurrentUser() user?: any) {
        return this.telephonyService.getNextLeadToCall(user?.workspaceId, user.id);
    }
}
