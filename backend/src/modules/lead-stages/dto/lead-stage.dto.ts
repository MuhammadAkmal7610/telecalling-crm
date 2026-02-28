import { IsString, IsOptional, IsEnum, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum StageType {
    INITIAL = 'initial',
    ACTIVE = 'active',
    WON = 'won',
    LOST = 'lost',
}

export class CreateLeadStageDto {
    @ApiProperty({ example: 'Interested' })
    @IsString()
    name: string;

    @ApiPropertyOptional({ enum: StageType, default: StageType.ACTIVE })
    @IsOptional()
    @IsEnum(StageType)
    type?: StageType;

    @ApiPropertyOptional({ example: 'bg-amber-100 text-amber-800 border-amber-200', description: 'Tailwind color classes' })
    @IsOptional()
    @IsString()
    color?: string;

    @ApiPropertyOptional({ example: 1, description: 'Display order position' })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    position?: number;

    @ApiPropertyOptional({ default: false })
    @IsOptional()
    @IsBoolean()
    isDefault?: boolean;
}

export class UpdateLeadStageDto extends PartialType(CreateLeadStageDto) { }

export class CreateLostReasonDto {
    @ApiProperty({ example: 'Budget Issues' })
    @IsString()
    reason: string;

    @ApiPropertyOptional({ example: 1 })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    position?: number;
}

export class UpdateLostReasonDto extends PartialType(CreateLostReasonDto) { }
