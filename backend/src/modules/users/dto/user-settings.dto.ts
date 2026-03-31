import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';

export enum PreferenceChannel {
  WEB = 'web',
  MOBILE = 'mobile',
}

export class NotificationPreferencesDto {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  paymentPending?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  paymentCompleted?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  paymentFailed?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  newLead?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  callReminder?: boolean;
}

export class UserSettingsDto {
  @ApiPropertyOptional({ enum: PreferenceChannel, example: 'web' })
  @IsOptional()
  @IsEnum(PreferenceChannel)
  emailHandler?: PreferenceChannel;

  @ApiPropertyOptional({ enum: PreferenceChannel, example: 'mobile' })
  @IsOptional()
  @IsEnum(PreferenceChannel)
  whatsappHandler?: PreferenceChannel;

  @ApiPropertyOptional({ type: NotificationPreferencesDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => NotificationPreferencesDto)
  notifications?: NotificationPreferencesDto;
}

