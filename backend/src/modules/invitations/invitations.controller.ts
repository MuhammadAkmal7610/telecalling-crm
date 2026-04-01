import { Controller, Post, Get, Body, Param, UseGuards, Delete, Put } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { InvitationsService } from './invitations.service';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@ApiTags('invitations')
@Controller('invitations')
export class InvitationsController {
    constructor(private readonly invitationsService: InvitationsService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new invitation' })
    async createInvitation(@Body() dto: { email: string; role: string; workspaceId?: string }, @CurrentUser() user: any) {
        return this.invitationsService.createInvitation(dto, user);
    }

    @Post('bulk')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Bulk invite users' })
    @ApiBody({ type: () => ({ users: [{ email: String, name: String, role: String }] }) })
    async bulkInvite(@Body() dto: { users: Array<{ email: string; name?: string; role?: string }> }, @CurrentUser() user: any) {
        return this.invitationsService.bulkInvite(dto.users, user);
    }

    @Get('pending')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'List pending invitations for the organization' })
    async listPending(@CurrentUser() user: any) {
        const organizationId = user.organizationId || user.organization_id;
        return this.invitationsService.listPendingInvitations(organizationId);
    }

    @Get('analytics')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get invitation analytics' })
    async getAnalytics(@CurrentUser() user: any) {
        const organizationId = user.organizationId || user.organization_id;
        return this.invitationsService.getAnalytics(organizationId);
    }

    @Get('settings')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get invitation settings for the organization' })
    async getSettings(@CurrentUser() user: any) {
        const organizationId = user.organizationId || user.organization_id;
        return this.invitationsService.getSettings(organizationId);
    }

    @Put('settings')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update invitation settings for the organization' })
    async updateSettings(@Body() settings: any, @CurrentUser() user: any) {
        const organizationId = user.organizationId || user.organization_id;
        return this.invitationsService.updateSettings(organizationId, settings);
    }

    // ==================== INVITE LINKS ====================

    @Post('links')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new invite link' })
    async createInviteLink(@Body() dto: { name: string; role: string; maxUses?: number; expiresAt?: string }, @CurrentUser() user: any) {
        return this.invitationsService.createInviteLink(dto, user);
    }

    @Get('links')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'List all invite links' })
    async listInviteLinks(@CurrentUser() user: any) {
        const organizationId = user.organizationId || user.organization_id;
        return this.invitationsService.listInviteLinks(organizationId);
    }

    @Get('links/:token')
    @SkipThrottle()
    @ApiOperation({ summary: 'Verify an invite link token' })
    async getInviteLinkByToken(@Param('token') token: string) {
        return this.invitationsService.getInviteLinkByToken(token);
    }

    @Post('links/:token/use')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Use an invite link to join organization' })
    async useInviteLink(@Param('token') token: string, @CurrentUser() user: any) {
        return this.invitationsService.useInviteLink(token, user.id);
    }

    @Post('links/:id/toggle')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Toggle invite link active status' })
    async toggleInviteLink(@Param('id') id: string, @CurrentUser() user: any) {
        const organizationId = user.organizationId || user.organization_id;
        return this.invitationsService.toggleInviteLink(id, organizationId);
    }

    @Delete('links/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete an invite link' })
    async deleteInviteLink(@Param('id') id: string, @CurrentUser() user: any) {
        const organizationId = user.organizationId || user.organization_id;
        return this.invitationsService.deleteInviteLink(id, organizationId);
    }

    // ==================== STANDARD INVITATIONS ====================

    @Get(':token')
    @SkipThrottle()
    @ApiOperation({ summary: 'Verify an invitation token' })
    async verifyToken(@Param('token') token: string) {
        return this.invitationsService.getInvitationByToken(token);
    }

    @Post(':token/accept')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Accept an invitation' })
    async acceptInvitation(@Param('token') token: string, @CurrentUser() user: any) {
        return this.invitationsService.acceptInvitation(token, user.id);
    }

    @Post(':id/resend')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Resend invitation email' })
    async resendInvitation(@Param('id') id: string, @CurrentUser() user: any) {
        const organizationId = user.organizationId || user.organization_id;
        return this.invitationsService.resendInvitation(id, organizationId);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Cancel/Delete an invitation' })
    async cancelInvitation(@Param('id') id: string, @CurrentUser() user: any) {
        const organizationId = user.organizationId || user.organization_id;
        return this.invitationsService.cancelInvitation(id, organizationId);
    }
}
