import { IsString, IsUrl, IsOptional, IsArray, IsObject, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateApiTemplateDto {
    @ApiProperty({ example: 'My Webhook' })
    @IsString()
    name: string;

    @ApiProperty({ example: 'https://api.example.com/webhook' })
    @IsUrl()
    endpoint: string;

    @ApiPropertyOptional({ default: 'POST' })
    @IsOptional()
    @IsString()
    method?: string = 'POST';

    @ApiPropertyOptional({ example: ['status', 'phone'] })
    @IsOptional()
    @IsArray()
    variables?: string[] = [];

    @ApiPropertyOptional({ example: { 'Content-Type': 'application/json' } })
    @IsOptional()
    @IsObject()
    headers?: Record<string, string> = {};

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    workflow_id?: string;
}

export class UpdateApiTemplateDto extends CreateApiTemplateDto {}
