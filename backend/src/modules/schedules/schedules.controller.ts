import {
    Controller, Get, Post, Patch, Delete, Body, Param, Query,
    UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SchedulesService } from './schedules.service';
import { CreateTaskDto, UpdateTaskDto, TaskQueryDto } from '../tasks/dto/task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Schedules')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('schedules')
export class SchedulesController {
    constructor(private readonly schedulesService: SchedulesService) { }

    @Post()
    @ApiOperation({ summary: 'Create a call followup schedule' })
    create(@Body() dto: CreateTaskDto, @CurrentUser() user: any) {
        return this.schedulesService.create(dto, user.id, user.workspaceId, user.organizationId);
    }

    @Get()
    @ApiOperation({ summary: 'List schedules (CallFollowup tasks) with filtering & pagination' })
    findAll(@Query() query: TaskQueryDto, @CurrentUser() user: any) {
        return this.schedulesService.findAll(query, user.workspaceId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a single schedule' })
    findOne(@Param('id') id: string, @CurrentUser() user: any) {
        return this.schedulesService.findOne(id, user.workspaceId);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a schedule' })
    update(@Param('id') id: string, @Body() dto: UpdateTaskDto, @CurrentUser() user: any) {
        return this.schedulesService.update(id, dto, user.workspaceId);
    }

    @Delete(':id')
    @Roles('admin', 'manager', 'root')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Delete a schedule' })
    remove(@Param('id') id: string, @CurrentUser() user: any) {
        return this.schedulesService.remove(id, user.workspaceId);
    }
}
