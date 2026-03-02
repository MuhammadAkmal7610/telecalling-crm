import { Injectable } from '@nestjs/common';
import { TasksService } from '../tasks/tasks.service';
import { CreateTaskDto, UpdateTaskDto, TaskQueryDto, TaskType } from '../tasks/dto/task.dto';

/**
 * SchedulesService wraps TasksService, always scoping to type=CallFollowup.
 * This keeps schedules as a first-class concept while reusing all task logic
 * (notifications, leads join, assignee join, filtering, pagination).
 */
@Injectable()
export class SchedulesService {
    constructor(private readonly tasksService: TasksService) { }

    async create(dto: CreateTaskDto, userId: string, workspaceId: string, organizationId: string) {
        return this.tasksService.create(
            { ...dto, type: TaskType.CALL_FOLLOWUP },
            userId,
            workspaceId,
            organizationId,
        );
    }

    async findAll(query: TaskQueryDto, workspaceId: string) {
        return this.tasksService.findAll(
            { ...query, type: TaskType.CALL_FOLLOWUP },
            workspaceId,
        );
    }

    async findOne(id: string, workspaceId: string) {
        return this.tasksService.findOne(id, workspaceId);
    }

    async update(id: string, dto: UpdateTaskDto, workspaceId: string) {
        return this.tasksService.update(id, dto, workspaceId);
    }

    async remove(id: string, workspaceId: string) {
        return this.tasksService.remove(id, workspaceId);
    }
}
