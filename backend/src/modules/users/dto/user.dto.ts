import {
    IsString, IsOptional, IsEmail, IsEnum, IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum UserRole {
    ROOT = 'root',
    ADMIN = 'admin',
    MANAGER = 'manager',
    CALLER = 'caller',
    MARKETING = 'marketing',
}

export enum UserStatus {
    WORKING = 'Working',
    ON_LEAVE = 'On Leave',
    INVITED = 'Invited',
    DELETED = 'Deleted',
}

export enum LicenseType {
    WHATSAPP_CHAT_SYNC = 'Whatsapp Chat Sync',
    CORE_CRM = 'Core crm',
}

export class InviteUserDto {
    @ApiProperty({ example: 'ali@company.com' })
    @IsEmail()
    email: string;

    @ApiPropertyOptional({ example: 'Ali Hassan' })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({ example: 'AH' })
    @IsOptional()
    @IsString()
    initials?: string;

    @ApiPropertyOptional({ example: 'Password123!' })
    @IsOptional()
    @IsString()
    password?: string;

    @ApiPropertyOptional({ example: '+923001234567' })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiPropertyOptional({ enum: UserRole, default: UserRole.CALLER })
    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;

    @ApiPropertyOptional({ description: 'Permission template ID to assign' })
    @IsOptional()
    @IsString()
    permissionTemplateId?: string;

    @ApiPropertyOptional({ enum: LicenseType })
    @IsOptional()
    @IsEnum(LicenseType)
    licenseType?: LicenseType;
}

export class UpdateUserDto {
    @ApiPropertyOptional({ example: 'Ali Hassan' })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({ enum: UserRole })
    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;

    @ApiPropertyOptional({ enum: UserStatus })
    @IsOptional()
    @IsEnum(UserStatus)
    status?: UserStatus;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    permissionTemplateId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    phone?: string;
}

export class AssignLicenseDto {
    @ApiProperty({ description: 'User ID to assign license to' })
    @IsString()
    userId: string;

    @ApiProperty({ enum: LicenseType })
    @IsEnum(LicenseType)
    licenseType: LicenseType;

    @ApiProperty({ example: '2027-03-17' })
    @IsDateString()
    expiryDate: string;
}

export class UserQueryDto {
    @ApiPropertyOptional({ example: 1 })
    @IsOptional()
    @Type(() => Number)
    page?: number = 1;

    @ApiPropertyOptional({ example: 20 })
    @IsOptional()
    @Type(() => Number)
    limit?: number = 20;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ enum: UserRole })
    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;

    @ApiPropertyOptional({ enum: UserStatus })
    @IsOptional()
    @IsEnum(UserStatus)
    status?: UserStatus;

    @ApiPropertyOptional({ enum: LicenseType })
    @IsOptional()
    @IsEnum(LicenseType)
    licenseType?: LicenseType;
}
