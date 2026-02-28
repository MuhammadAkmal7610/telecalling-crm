import {
    IsString, IsOptional, IsEnum, IsDateString, IsUUID, IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum TaskStatus {
    PENDING = 'Pending',
    RESCHEDULED = 'Rescheduled',
    LATE = 'Late',
    DONE = 'Done',
    CANCELLED = 'Cancelled',
}

export enum TaskPriority {
    URGENT = 'Urgent',
    HIGH = 'High',
    MEDIUM = 'Medium',
    LOW = 'Low',
    NONE = 'None',
}

export enum TaskType {
    CALL_FOLLOWUP = 'CallFollowup',
    TODO = 'Todo',
}

export class CreateTaskDto {
    @ApiProperty({ example: 'Call back regarding pricing query' })
    @IsString()
    description: string;

    @ApiPropertyOptional({ enum: TaskType, default: TaskType.CALL_FOLLOWUP })
    @IsOptional()
    @IsEnum(TaskType)
    type?: TaskType;

    @ApiPropertyOptional({ enum: TaskStatus, default: TaskStatus.PENDING })
    @IsOptional()
    @IsEnum(TaskStatus)
    status?: TaskStatus;

    @ApiPropertyOptional({ enum: TaskPriority, default: TaskPriority.NONE })
    @IsOptional()
    @IsEnum(TaskPriority)
    priority?: TaskPriority;

    @ApiPropertyOptional({ example: '2026-02-28T10:00:00Z' })
    @IsOptional()
    @IsDateString()
    dueDate?: string;

    @ApiPropertyOptional({ description: 'Lead UUID this task belongs to' })
    @IsOptional()
    @IsString()
    leadId?: string;

    @ApiPropertyOptional({ description: 'User UUID assigned to this task' })
    @IsOptional()
    @IsString()
    assigneeId?: string;

    @IsOptional()
    @IsString()
    organizationId?: string;
}

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
    @ApiPropertyOptional({ example: '2026-02-28T10:30:00Z', description: 'Completion timestamp' })
    @IsOptional()
    @IsDateString()
    completedAt?: string;
}

export class TaskQueryDto {
    @ApiPropertyOptional({ example: 1 })
    @IsOptional()
    @Type(() => Number)
    page?: number = 1;

    @ApiPropertyOptional({ example: 20 })
    @IsOptional()
    @Type(() => Number)
    limit?: number = 20;

    @ApiPropertyOptional({ enum: TaskType })
    @IsOptional()
    @IsEnum(TaskType)
    type?: TaskType;

    @ApiPropertyOptional({ enum: TaskStatus })
    @IsOptional()
    @IsEnum(TaskStatus)
    status?: TaskStatus;

    @ApiPropertyOptional({ enum: TaskPriority })
    @IsOptional()
    @IsEnum(TaskPriority)
    priority?: TaskPriority;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    assigneeId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    leadId?: string;

    @ApiPropertyOptional({ description: 'Filter: today | yesterday | this_week | this_month' })
    @IsOptional()
    @IsString()
    due?: string;

    @IsOptional()
    @IsString()
    organizationId?: string;
}
