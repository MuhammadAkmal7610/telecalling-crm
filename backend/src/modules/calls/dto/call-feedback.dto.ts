import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateCallFeedbackStatusDto {
    @ApiProperty({ example: 'CONNECTED' })
    @IsString()
    label: string;

    @ApiPropertyOptional({ example: false, description: 'Default status auto-assigned after connected call' })
    @IsOptional()
    @IsBoolean()
    isDefault?: boolean;

    @ApiPropertyOptional({ example: 1, description: 'Display order' })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    position?: number;
}

export class UpdateCallFeedbackStatusDto extends PartialType(CreateCallFeedbackStatusDto) { }
