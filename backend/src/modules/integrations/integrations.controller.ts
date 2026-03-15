import { Controller, Get, Post, UseGuards, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { IntegrationsService } from './integrations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('integrations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('integrations')
@Roles('admin', 'root')
export class IntegrationsController {
    constructor(private readonly integrationsService: IntegrationsService) { }

    @ApiOperation({ summary: 'Get all integrations' })
    @Get()
    async findAll(@CurrentUser() user: any) {
        // Use workspace_id here, but we need to ensure the user has access to this workspace
        // For simplicity, we'll use organizationId for now if workspaceId is not provided
        const workspaceId = user.currentWorkspaceId; // Assuming this is present in the token
        return { data: await this.integrationsService.findAll(workspaceId) };
    }

    @ApiOperation({ summary: 'Get Google Auth URL' })
    @Get('auth/google')
    getGoogleAuthUrl(@CurrentUser() user: any) {
        return { url: this.integrationsService.getGoogleAuthUrl(user.currentWorkspaceId) };
    }

    @ApiOperation({ summary: 'Get Outlook Auth URL' })
    @Get('auth/outlook')
    getOutlookAuthUrl(@CurrentUser() user: any) {
        return { url: this.integrationsService.getOutlookAuthUrl(user.currentWorkspaceId) };
    }

    @ApiOperation({ summary: 'Google OAuth Callback' })
    @Get('callback/google')
    async googleCallback(@Query('code') code: string, @Query('state') state: string, @Res() res: Response) {
        // state contains workspaceId
        // organizationId might be needed, but we can try to find it from the workspaceId
        try {
            // We need to pass a dummy orgId for now or update handleGoogleCallback to find it
            // Actually, handleGoogleCallback should probably find the workspace/org from the state
            await this.integrationsService.handleGoogleCallback(code, state, ''); 
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/integrations?status=success&provider=google`);
        } catch (error) {
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/integrations?status=error&message=${encodeURIComponent(error.message)}`);
        }
    }

    @ApiOperation({ summary: 'Outlook OAuth Callback' })
    @Get('callback/outlook')
    async outlookCallback(@Query('code') code: string, @Query('state') state: string, @Res() res: Response) {
        try {
            await this.integrationsService.handleOutlookCallback(code, state, '');
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/integrations?status=success&provider=outlook`);
        } catch (error) {
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/integrations?status=error&message=${encodeURIComponent(error.message)}`);
        }
    }
}
