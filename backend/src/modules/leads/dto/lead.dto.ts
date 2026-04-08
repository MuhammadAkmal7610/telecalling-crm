import {
    IsString, IsOptional, IsEmail, IsNumber, IsEnum, Min, Max,
    IsUUID, IsArray, IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';

export enum LeadStatus {
    FRESH = 'Fresh',
    ACTIVE = 'Active',
    INTERESTED = 'Interested',
    HOT = 'Hot',
    SCHEDULED = 'Scheduled',
    WON = 'Won',
    LOST = 'Lost',
    COLD = 'Cold',
    ARCHIVE = 'Archive',
    TRASH = 'Trash',
}

export enum LeadSource {
    FACEBOOK = 'Facebook',
    WEBSITE = 'Website',
    WHATSAPP = 'WhatsApp',
    REFERRAL = 'Referral',
    MANUAL = 'Manual',
    IMPORT = 'Import',
    INDIAMART = 'IndiaMART',
    JUSTDIAL = 'Justdial',
    GOOGLE_ADS = 'Google Ads',
}

export class CreateLeadDto {
    @ApiProperty({ example: 'Ali Hassan' })
    @IsString()
    name: string;

    @ApiProperty({ example: '923001234567', description: 'Phone is the Lead ID' })
    @IsString()
    phone: string;

    @ApiPropertyOptional({ example: '923007654321' })
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value === '' ? undefined : value)
    altPhone?: string;

    @ApiPropertyOptional({ example: '923007654321', description: 'Alias for altPhone' })
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value === '' ? undefined : value)
    alt_phone?: string;

    @ApiPropertyOptional({ example: 'ali@example.com' })
    @IsOptional()
    @IsEmail()
    @Transform(({ value }) => value === '' ? undefined : value)
    email?: string;

    @ApiPropertyOptional({ example: 'Karachi' })
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value === '' ? undefined : value)
    city?: string;

    @ApiPropertyOptional({ example: 'Acme Corp', description: 'Company name' })
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value === '' ? undefined : value)
    company?: string;

    @ApiPropertyOptional({ example: 28 })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(120)
    @Type(() => Number)
    @Transform(({ value }) => value === '' ? undefined : value)
    age?: number;

    @ApiPropertyOptional({ example: 'Ali Khan', description: 'Job title' })
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value === '' ? undefined : value)
    jobTitle?: string;

    @ApiPropertyOptional({ enum: LeadSource, default: LeadSource.MANUAL })
    @IsOptional()
    @IsEnum(LeadSource)
    @Transform(({ value }) => value === '' ? undefined : value)
    source?: LeadSource;

    @ApiPropertyOptional({ enum: LeadStatus, default: LeadStatus.FRESH })
    @IsOptional()
    @IsEnum(LeadStatus)
    @Transform(({ value }) => value === '' ? undefined : value)
    status?: LeadStatus;

    @ApiPropertyOptional({ example: 'uuid-of-stage' })
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value === '' ? undefined : value)
    stageId?: string;

    @ApiPropertyOptional({ example: 'uuid-of-stage', description: 'Alias for stageId' })
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value === '' ? undefined : value)
    stage_id?: string;

    @ApiPropertyOptional({ example: 'uuid-of-user' })
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value === '' ? undefined : value)
    assigneeId?: string;

    @ApiPropertyOptional({ example: 'uuid-of-user', description: 'Alias for assigneeId' })
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value === '' ? undefined : value)
    assignee_id?: string;

    @ApiPropertyOptional({ example: 0, minimum: 0, maximum: 5 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(5)
    @Type(() => Number)
    @Transform(({ value }) => value === '' ? undefined : value)
    rating?: number;

    @ApiPropertyOptional({ example: '10:00 AM' })
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value === '' ? undefined : value)
    bestTimeToCall?: string;

    // ---added by akmal-----added by akmal--Facebook lead fields
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value === '' ? undefined : value)
    facebookAd?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value === '' ? undefined : value)
    facebookCampaign?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value === '' ? undefined : value)
    facebookLeadId?: string;

    @ApiPropertyOptional({ description: 'Custom field values as key-value pairs' })
    @IsOptional()
    @IsObject()
    @Transform(({ value }) => value === '' ? undefined : value)
    customFields?: Record<string, any>;

    @ApiPropertyOptional({ description: 'Alias for customFields' })
    @IsOptional()
    @IsObject()
    @Transform(({ value }) => value === '' ? undefined : value)
    custom_fields?: Record<string, any>;

    @ApiPropertyOptional({ description: 'List IDs this lead belongs to' })
    @IsOptional()
    @IsArray()
    listIds?: string[];

    @ApiPropertyOptional({ example: 'uuid-of-campaign' })
    @IsOptional()
    @IsUUID()
    @Transform(({ value }) => value === '' ? undefined : value)
    campaignId?: string;

    @ApiPropertyOptional({ example: 'uuid-of-campaign', description: 'Alias for campaignId' })
    @IsOptional()
    @IsUUID()
    @Transform(({ value }) => value === '' ? undefined : value)
    campaign_id?: string;

    @IsOptional()
    @IsString()
    organizationId?: string;

    @ApiPropertyOptional({ example: 'uuid-of-pipeline' })
    @IsOptional()
    @IsUUID()
    @Transform(({ value }) => value === '' ? undefined : value)
    pipelineId?: string;

    @ApiPropertyOptional({ example: 'uuid-of-pipeline', description: 'Alias for pipelineId' })
    @IsOptional()
    @IsUUID()
    @Transform(({ value }) => value === '' ? undefined : value)
    pipeline_id?: string;
}

export class UpdateLeadDto extends PartialType(CreateLeadDto) {
    @ApiPropertyOptional({ description: 'Lost reason if status is Lost' })
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value === '' ? undefined : value)
    lostReason?: string;

    @ApiPropertyOptional({ description: 'Alias for lostReason' })
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value === '' ? undefined : value)
    lost_reason?: string;
}

export class LeadQueryDto {
    @ApiPropertyOptional({ example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    page?: number = 1;

    @ApiPropertyOptional({ example: 20 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    limit?: number = 20;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ enum: LeadStatus })
    @IsOptional()
    @IsEnum(LeadStatus)
    @Transform(({ value }) => {
        if (typeof value !== 'string') return value;
        const entry = Object.values(LeadStatus).find(
            (v) => v.toLowerCase() === value.toLowerCase()
        );
        return entry || value;
    })
    status?: LeadStatus;

    @ApiPropertyOptional({ enum: LeadSource })
    @IsOptional()
    @IsEnum(LeadSource)
    @Transform(({ value }) => {
        if (typeof value !== 'string') return value;
        const entry = Object.values(LeadSource).find(
            (v) => v.toLowerCase() === value.toLowerCase()
        );
        return entry || value;
    })
    source?: LeadSource;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    assigneeId?: string;

    @ApiPropertyOptional({ description: 'Alias for assigneeId' })
    @IsOptional()
    @IsString()
    assignee_id?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    stageId?: string;

    @ApiPropertyOptional({ description: 'Alias for stageId' })
    @IsOptional()
    @IsString()
    stage_id?: string;

    @ApiPropertyOptional({ description: 'Filter by old/archived leads' })
    @IsOptional()
    @IsString()
    archive?: string;

    @ApiPropertyOptional({ description: 'Filter by campaign ID' })
    @IsOptional()
    @IsUUID()
    campaignId?: string;

    @ApiPropertyOptional({ description: 'Alias for campaignId' })
    @IsOptional()
    @IsUUID()
    campaign_id?: string;

    @IsOptional()
    @IsString()
    organizationId?: string;

    @ApiPropertyOptional({ example: '30d' })
    @IsOptional()
    @IsString()
    timeRange?: string;

    @ApiPropertyOptional({ description: 'Filter by pipeline ID' })
    @IsOptional()
    @IsUUID()
    pipelineId?: string;

    @ApiPropertyOptional({ description: 'Alias for pipelineId' })
    @IsOptional()
    @IsUUID()
    pipeline_id?: string;
}
