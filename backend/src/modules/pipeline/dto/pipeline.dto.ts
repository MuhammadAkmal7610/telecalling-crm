import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreatePipelineDto {
    @ApiProperty({ example: 'Sales Pipeline' })
    @IsString()
    name: string;

    @ApiPropertyOptional({ example: 'Main sales process' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ example: false })
    @IsOptional()
    @IsBoolean()
    is_default?: boolean;

    @ApiPropertyOptional({ example: 0 })
    @IsOptional()
    @IsNumber()
    position?: number;
}

export class UpdatePipelineDto extends PartialType(CreatePipelineDto) {}
