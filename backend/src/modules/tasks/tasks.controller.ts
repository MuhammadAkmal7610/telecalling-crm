import {
    Controller, Get, Post, Patch, Delete, Body, Param, Query,
    UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, TaskQueryDto } from './dto/task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
    constructor(private readonly tasksService: TasksService) { }

    @Post()
    @ApiOperation({ summary: 'Create a task' })
    create(@Body() dto: CreateTaskDto, @CurrentUser() user: any) {
        return this.tasksService.create(dto, user.id, user.organizationId);
    }

    @Get()
    @ApiOperation({ summary: 'List tasks with filtering & pagination' })
    findAll(@Query() query: TaskQueryDto, @CurrentUser() user: any) {
        return this.tasksService.findAll(query, user.organizationId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a single task' })
    findOne(@Param('id') id: string, @CurrentUser() user: any) {
        return this.tasksService.findOne(id, user.organizationId);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a task' })
    update(@Param('id') id: string, @Body() dto: UpdateTaskDto, @CurrentUser() user: any) {
        return this.tasksService.update(id, dto, user.organizationId);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Delete a task' })
    remove(@Param('id') id: string, @CurrentUser() user: any) {
        return this.tasksService.remove(id, user.organizationId);
    }

    @Post('bulk')
    @ApiOperation({ summary: 'Bulk create tasks' })
    bulkCreate(@Body() body: { tasks: CreateTaskDto[] }, @CurrentUser() user: any) {
        return this.tasksService.bulkCreate(body.tasks, user.id, user.organizationId);
    }
}
