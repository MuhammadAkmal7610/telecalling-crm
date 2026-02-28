import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum ActivityType {
    CALL = 'call',
    EMAIL = 'email',
    WHATSAPP = 'whatsapp',
    MEETING = 'meeting',
    NOTE = 'note',
    STATUS_CHANGE = 'status_change',
    TASK = 'task',
}

export class CreateActivityDto {
    @ApiProperty({ enum: ActivityType })
    @IsEnum(ActivityType)
    type: ActivityType;

    @ApiProperty({ example: 'Outbound Call - Connected' })
    @IsString()
    title: string;

    @ApiPropertyOptional({ example: 'Sarah Wilson' })
    @IsOptional()
    @IsString()
    subtitle?: string;

    @ApiPropertyOptional({ example: 'Discussed project requirements and timeline.' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ example: '4m 32s' })
    @IsOptional()
    @IsString()
    duration?: string;

    @ApiPropertyOptional({ description: 'Lead UUID this activity is linked to' })
    @IsOptional()
    @IsString()
    leadId?: string;
}

export class ActivityQueryDto {
    @ApiPropertyOptional({ example: 1 })
    @IsOptional()
    @Type(() => Number)
    page?: number = 1;

    @ApiPropertyOptional({ example: 20 })
    @IsOptional()
    @Type(() => Number)
    limit?: number = 20;

    @ApiPropertyOptional({ enum: ActivityType })
    @IsOptional()
    @IsEnum(ActivityType)
    type?: ActivityType;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    leadId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    userId?: string;

    @ApiPropertyOptional({ description: 'today | yesterday | this_week | this_month' })
    @IsOptional()
    @IsString()
    period?: string;
}
