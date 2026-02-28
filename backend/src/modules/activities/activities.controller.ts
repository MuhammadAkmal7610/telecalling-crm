import {
    Controller, Get, Post, Delete, Body, Param, Query,
    UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto, ActivityQueryDto } from './dto/activity.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Activities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('activities')
export class ActivitiesController {
    constructor(private readonly activitiesService: ActivitiesService) { }

    @Post()
    @ApiOperation({ summary: 'Log an activity' })
    create(@Body() dto: CreateActivityDto, @CurrentUser() user: any) {
        return this.activitiesService.create(dto, user.id, user.organizationId);
    }

    @Get()
    @ApiOperation({ summary: 'List activities with filtering & pagination' })
    findAll(@Query() query: ActivityQueryDto, @CurrentUser() user: any) {
        return this.activitiesService.findAll(query, user.organizationId);
    }

    @Get('lead/:leadId')
    @ApiOperation({ summary: 'Get timeline of activities for a specific lead' })
    findByLead(@Param('leadId') leadId: string, @CurrentUser() user: any) {
        return this.activitiesService.findByLead(leadId, user.organizationId);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Delete an activity log entry' })
    remove(@Param('id') id: string, @CurrentUser() user: any) {
        return this.activitiesService.remove(id, user.organizationId);
    }
}
