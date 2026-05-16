import { Controller, Get, Patch, Post, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    /**
     * POST /admin/login
     * Public superadmin authentication.
     */
    @Post('login')
    @ApiOperation({ summary: 'Login Super Admin (Product Owner)' })
    loginSuperAdmin(@Body() loginDto: any) {
        return this.adminService.loginSuperAdmin(loginDto);
    }

    /**
     * GET /admin/super-stats
     * Super Admin platform-wide telemetry overview.
     */
    @Get('super-stats')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('root', 'admin')
    @ApiOperation({ summary: 'Get Product Owner platform overview' })
    getSuperStats() {
        return this.adminService.getSuperStats();
    }

    /**
     * GET /admin/organizations
     */
    @Get('organizations')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('root', 'admin')
    @ApiOperation({ summary: 'List all client organizations' })
    getOrganizations() {
        return this.adminService.getSuperOrganizations();
    }

    /**
     * POST /admin/organizations
     */
    @Post('organizations')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('root', 'admin')
    @ApiOperation({ summary: 'Provision new client organization' })
    createOrganization(@Body() orgData: any) {
        return this.adminService.createOrganization(orgData);
    }

    /**
     * PATCH /admin/organizations/:id
     */
    @Patch('organizations/:id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('root', 'admin')
    @ApiOperation({ summary: 'Update organization subscription & feature gates' })
    updateOrganization(@Param('id') id: string, @Body() updateData: any) {
        return this.adminService.updateOrganization(id, updateData);
    }

    /**
     * DELETE /admin/organizations/:id
     */
    @Delete('organizations/:id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('root')
    @ApiOperation({ summary: 'Delete client organization' })
    deleteOrganization(@Param('id') id: string) {
        return this.adminService.deleteOrganization(id);
    }

    /**
     * GET /admin/workspaces
     */
    @Get('workspaces')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('root', 'admin')
    @ApiOperation({ summary: 'List all multi-tenant workspaces' })
    getWorkspaces() {
        return this.adminService.getSuperWorkspaces();
    }

    /**
     * POST /admin/workspaces
     */
    @Post('workspaces')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('root', 'admin')
    @ApiOperation({ summary: 'Provision workspace node' })
    createWorkspace(@Body() wsData: any) {
        return this.adminService.createWorkspace(wsData);
    }

    /**
     * PATCH /admin/workspaces/:id
     */
    @Patch('workspaces/:id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('root', 'admin')
    @ApiOperation({ summary: 'Update workspace attributes' })
    updateWorkspace(@Param('id') id: string, @Body() updateData: any) {
        return this.adminService.updateWorkspace(id, updateData);
    }

    /**
     * DELETE /admin/workspaces/:id
     */
    @Delete('workspaces/:id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('root')
    @ApiOperation({ summary: 'Delete workspace node' })
    deleteWorkspace(@Param('id') id: string) {
        return this.adminService.deleteWorkspace(id);
    }

    /**
     * GET /admin/super-users
     */
    @Get('super-users')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('root', 'admin')
    @ApiOperation({ summary: 'List all platform users' })
    getSuperUsers() {
        return this.adminService.getSuperUsers();
    }

    /**
     * POST /admin/super-users
     */
    @Post('super-users')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('root', 'admin')
    @ApiOperation({ summary: 'Create user node' })
    createSuperUser(@Body() userData: any) {
        return this.adminService.createSuperUser(userData);
    }

    /**
     * PATCH /admin/super-users/:id
     */
    @Patch('super-users/:id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('root', 'admin')
    @ApiOperation({ summary: 'Update user role or status' })
    updateSuperUser(@Param('id') id: string, @Body() updateData: any) {
        return this.adminService.updateSuperUser(id, updateData);
    }

    /**
     * GET /admin/telephony/trunks
     */
    @Get('telephony/trunks')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('root', 'admin')
    @ApiOperation({ summary: 'List telephony trunks & gateways' })
    getTrunks() {
        return this.adminService.getSuperTrunks();
    }

    /**
     * PATCH /admin/telephony/trunks/:id
     */
    @Patch('telephony/trunks/:id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('root', 'admin')
    @ApiOperation({ summary: 'Update telephony trunk configuration' })
    updateTrunk(@Param('id') id: string, @Body() updateData: any) {
        return this.adminService.updateSuperTrunk(id, updateData);
    }

    /**
     * GET /admin/whatsapp/templates
     */
    @Get('whatsapp/templates')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('root', 'admin')
    @ApiOperation({ summary: 'List WhatsApp verification templates' })
    getTemplates() {
        return this.adminService.getSuperTemplates();
    }

    /**
     * PATCH /admin/whatsapp/templates/:id
     */
    @Patch('whatsapp/templates/:id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('root', 'admin')
    @ApiOperation({ summary: 'Evaluate WhatsApp template approval status' })
    updateTemplate(@Param('id') id: string, @Body() updateData: any) {
        return this.adminService.updateSuperTemplate(id, updateData);
    }

    /**
     * GET /admin/workflows
     */
    @Get('workflows')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('root', 'admin')
    @ApiOperation({ summary: 'List global automation workflows' })
    getWorkflows() {
        return this.adminService.getSuperWorkflows();
    }

    /**
     * PATCH /admin/workflows/:id
     */
    @Patch('workflows/:id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('root', 'admin')
    @ApiOperation({ summary: 'Toggle workflow active status' })
    updateWorkflow(@Param('id') id: string, @Body() updateData: any) {
        return this.adminService.updateSuperWorkflow(id, updateData);
    }

    /**
     * GET /admin/audit-logs
     */
    @Get('audit-logs')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('root', 'admin')
    @ApiOperation({ summary: 'List platform audit logs' })
    getAuditLogs() {
        return this.adminService.getSuperAuditLogs();
    }

    // --- Legacy endpoints preserved ---
    @Get('stats')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'root')
    @ApiOperation({ summary: 'Get org-wide admin statistics' })
    getStats(@CurrentUser() user: any) {
        return this.adminService.getOrgStats(user.organizationId);
    }

    @Get('users')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'root')
    @ApiOperation({ summary: 'Get all org users' })
    getUsers(@CurrentUser() user: any) {
        return this.adminService.getOrgUsers(user.organizationId);
    }

    @Patch('users/:id/role')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('root')
    @ApiOperation({ summary: 'Update user role (root only)' })
    updateRole(
        @Param('id') id: string,
        @Body('role') role: string,
        @CurrentUser() user: any,
    ) {
        return this.adminService.updateUserRole(id, role, user.organizationId);
    }

    @Get('activity')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'root')
    @ApiOperation({ summary: 'Get recent org-wide activity feed' })
    getActivity(@CurrentUser() user: any, @Query('limit') limit?: string) {
        return this.adminService.getRecentActivity(user.organizationId, limit ? parseInt(limit, 10) : 20);
    }
}
