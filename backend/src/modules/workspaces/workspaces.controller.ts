import {
    Controller, Get, Post, Patch, Delete,
    Param, Body, UseGuards,
    BadRequestException,
} from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { WorkspaceSettingsDto } from './dto/workspace-settings.dto';

@Controller('workspaces')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkspacesController {
    constructor(private readonly workspacesService: WorkspacesService) { }

    // ─── Workspace CRUD ───────────────────────────────────────────────────────

    /** List all workspaces in the org (admin/manager) */
    @Get()
    findAll(@CurrentUser() user: any) {
        return this.workspacesService.findAllInOrg(user.organizationId);
    }

    /** List only workspaces this user is a member of */
    @Get('my')
    findMine(@CurrentUser() user: any) {
        return this.workspacesService.findUserWorkspaces(user.id, user.organizationId);
    }

    /** Get a single workspace by id */
    @Get(':id')
    findOne(@Param('id') id: string, @CurrentUser() user: any) {
        return this.workspacesService.findOneWorkspace(id, user.organizationId);
    }

    /** Create a new workspace (admin only) */
    @Post()
    @Roles('admin', 'root')
    create(@Body() dto: { name: string; description?: string }, @CurrentUser() user: any) {
        return this.workspacesService.createWorkspace(dto, user);
    }

    /** Update workspace name/description (admin only) */
    @Patch(':id')
    @Roles('admin', 'root')
    update(
        @Param('id') id: string,
        @Body() dto: { name?: string; description?: string },
        @CurrentUser() user: any,
    ) {
        return this.workspacesService.updateWorkspace(id, dto, user.organizationId);
    }

    /** Delete a workspace (admin only, cannot delete default) */
    @Delete(':id')
    @Roles('admin', 'root')
    remove(@Param('id') id: string, @CurrentUser() user: any) {
        return this.workspacesService.deleteWorkspace(id, user.organizationId);
    }

    // ─── Workspace Members ────────────────────────────────────────────────────

    /** List members of a workspace */
    @Get(':id/members')
    @Roles('manager')
    getMembers(@Param('id') id: string, @CurrentUser() user: any) {
        return this.workspacesService.getWorkspaceMembers(id, user.organizationId);
    }

    /** Add a user to a workspace (admin only) */
    @Post(':id/members')
    @Roles('admin', 'root')
    addMember(
        @Param('id') id: string,
        @Body() body: { userId: string; role?: string },
        @CurrentUser() user: any,
    ) {
        return this.workspacesService.addMember(id, body.userId, body.role || 'caller');
    }

    /** Change a member's role within a workspace (admin only) */
    @Patch(':id/members/:userId')
    @Roles('admin', 'root')
    updateMemberRole(
        @Param('id') id: string,
        @Param('userId') userId: string,
        @Body() body: { role: string },
        @CurrentUser() user: any,
    ) {
        return this.workspacesService.updateMemberRole(id, userId, body.role, user.organizationId);
    }

    /** Remove a member from a workspace (admin only) */
    @Delete(':id/members/:userId')
    @Roles('admin', 'root')
    removeMember(
        @Param('id') id: string,
        @Param('userId') userId: string,
        @CurrentUser() user: any,
    ) {
        return this.workspacesService.removeMember(id, userId, user.organizationId);
    }

    /** GET /workspaces/my/settings — current workspace preferences */
    @Get('my/settings')
    getMySettings(@CurrentUser() user: any) {
        if (!user.workspaceId) throw new BadRequestException('x-workspace-id header is required');
        const isOrgAdminOrRoot = user.orgRole === 'admin' || user.orgRole === 'root';
        return this.workspacesService.getMySettings(user.id, user.workspaceId, user.organizationId, isOrgAdminOrRoot);
    }

    /** PATCH /workspaces/my/settings — update current workspace preferences */
    @Patch('my/settings')
    updateMySettings(@CurrentUser() user: any, @Body() dto: WorkspaceSettingsDto) {
        if (!user.workspaceId) throw new BadRequestException('x-workspace-id header is required');
        const isOrgAdminOrRoot = user.orgRole === 'admin' || user.orgRole === 'root';
        return this.workspacesService.updateMySettings(user.id, user.workspaceId, user.organizationId, isOrgAdminOrRoot, dto);
    }
}
