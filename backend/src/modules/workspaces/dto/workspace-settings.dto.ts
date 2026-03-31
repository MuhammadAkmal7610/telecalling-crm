import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export enum SessionTimeoutOption {
  NEVER = 'Never',
  MIN_30 = '30 Minutes',
  HOUR_1 = '1 Hour',
  HOUR_4 = '4 Hours',
}

export class WorkspaceToggleSettingsDto {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  newReporting?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  leadStage?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  leadRating?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  locationCheckIn?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  campaign?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  customActions?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  salesGroup?: boolean;
}

export class WorkspaceSettingsDto {
  @ApiPropertyOptional({ example: '92' })
  @IsOptional()
  @IsString()
  countryCode?: string;

  @ApiPropertyOptional({ example: 'Asia/Karachi' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ example: 'PKR' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minDuration?: number;

  @ApiPropertyOptional({
    enum: SessionTimeoutOption,
    example: SessionTimeoutOption.NEVER,
  })
  @IsOptional()
  @IsEnum(SessionTimeoutOption)
  sessionTimeout?: SessionTimeoutOption;

  @ApiPropertyOptional({ type: WorkspaceToggleSettingsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => WorkspaceToggleSettingsDto)
  toggles?: WorkspaceToggleSettingsDto;
}

