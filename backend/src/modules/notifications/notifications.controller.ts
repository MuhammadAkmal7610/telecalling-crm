import { Controller, Get, Post, Patch, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    @ApiOperation({ summary: 'Get all notifications for current user' })
    findAll(@CurrentUser() user: any) {
        return this.notificationsService.findAll(user.id, user.organizationId);
    }

    @Patch(':id/read')
    @ApiOperation({ summary: 'Mark a notification as read' })
    markRead(@Param('id') id: string, @CurrentUser() user: any) {
        return this.notificationsService.markAsRead(id, user.id, user.organizationId);
    }

    @Post('mark-all-read')
    @ApiOperation({ summary: 'Mark all notifications as read' })
    markAllRead(@CurrentUser() user: any) {
        return this.notificationsService.markAllRead(user.id, user.organizationId);
    }
}
