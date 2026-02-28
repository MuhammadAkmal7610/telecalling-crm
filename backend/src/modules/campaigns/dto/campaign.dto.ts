import { IsString, IsOptional, IsEnum, IsArray, IsNumber, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum CampaignStatus {
    ACTIVE = 'Active',
    PAUSED = 'Paused',
    COMPLETED = 'Completed',
    ARCHIVED = 'Archived',
}

export enum CampaignPriority {
    HIGH = 'High',
    MEDIUM = 'Medium',
    LOW = 'Low',
}

export class CreateCampaignDto {
    @ApiProperty({ example: '@facebook-ad-leads' })
    @IsString()
    name: string;

    @ApiPropertyOptional({ enum: CampaignPriority, default: CampaignPriority.MEDIUM })
    @IsOptional()
    @IsEnum(CampaignPriority)
    priority?: CampaignPriority;

    @ApiPropertyOptional({ enum: CampaignStatus, default: CampaignStatus.ACTIVE })
    @IsOptional()
    @IsEnum(CampaignStatus)
    status?: CampaignStatus;

    @ApiPropertyOptional({ description: 'Array of user IDs assigned to this campaign' })
    @IsOptional()
    @IsArray()
    assigneeIds?: string[];

    @ApiPropertyOptional({ example: 'Campaign description' })
    @IsOptional()
    @IsString()
    description?: string;
}

export class UpdateCampaignDto extends PartialType(CreateCampaignDto) { }

export class CampaignQueryDto {
    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    page?: number = 1;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    limit?: number = 20;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ enum: CampaignStatus })
    @IsOptional()
    @IsEnum(CampaignStatus)
    status?: CampaignStatus;

    @ApiPropertyOptional({ enum: CampaignPriority })
    @IsOptional()
    @IsEnum(CampaignPriority)
    priority?: CampaignPriority;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    assigneeId?: string;
}
