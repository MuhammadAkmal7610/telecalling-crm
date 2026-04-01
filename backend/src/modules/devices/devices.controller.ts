import { Controller, Get, Post, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser as CurrentUserDecorator } from '../auth/decorators/current-user.decorator';
import type { RegisterDeviceDto } from './devices.service';
import { DevicesService } from './devices.service';

@ApiTags('Devices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('devices')
export class DevicesController {
    constructor(private readonly devicesService: DevicesService) { }

    @Post('register')
    @ApiOperation({ summary: 'Register a new device or update existing' })
    async registerDevice(
        @Body() dto: RegisterDeviceDto,
        @CurrentUserDecorator() user: any,
    ) {
        return this.devicesService.registerDevice(user.id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Unregister a device' })
    async unregisterDevice(@Param('id') id: string) {
        return this.devicesService.unregisterDevice(id);
    }

    @Get('me')
    @ApiOperation({ summary: 'Get current user active device' })
    async getMyDevice(@CurrentUserDecorator() user: any) {
        return this.devicesService.getActiveDeviceForUser(user.id);
    }

    @Get('my-devices')
    @ApiOperation({ summary: 'Get all active devices for current user' })
    async getMyDevices(@CurrentUserDecorator() user: any) {
        return this.devicesService.getAllActiveDevicesForUser(user.id);
    }

    @Post('call-request')
    @ApiOperation({ summary: 'Send a call request to user device' })
    @ApiQuery({ name: 'userId', required: true, description: 'Target user ID' })
    async sendCallRequest(
        @Query('userId') userId: string,
        @Body() callData: {
            leadId: string;
            leadName: string;
            leadPhone: string;
            workspaceId: string;
            organizationId: string;
        },
        @CurrentUserDecorator() user: any,
    ) {
        return this.devicesService.sendCallRequestToDevice(userId, callData);
    }
}