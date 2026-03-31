import { Controller, Post, Get, Body, Param, UseGuards, Delete } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { InvitationsService } from './invitations.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

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

    @Get('pending')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'List pending invitations for the organization' })
    async listPending(@CurrentUser() user: any) {
        const organizationId = user.organizationId || user.organization_id;
        return this.invitationsService.listPendingInvitations(organizationId);
    }

    @Get(':token')
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

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Cancel/Delete an invitation' })
    async cancelInvitation(@Param('id') id: string, @CurrentUser() user: any) {
        const organizationId = user.organizationId || user.organization_id;
        return this.invitationsService.cancelInvitation(id, organizationId);
    }
}
