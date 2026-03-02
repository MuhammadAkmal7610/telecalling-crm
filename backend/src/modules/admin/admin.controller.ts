import { Controller, Get, Patch, Param, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'root')
@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    /**
     * GET /admin/stats
     * Full org-wide statistical overview for the admin dashboard.
     */
    @Get('stats')
    @ApiOperation({ summary: 'Get org-wide admin statistics' })
    getStats(@CurrentUser() user: any) {
        return this.adminService.getOrgStats(user.organizationId);
    }

    /**
     * GET /admin/users
     * All users in the organization.
     */
    @Get('users')
    @ApiOperation({ summary: 'Get all org users' })
    getUsers(@CurrentUser() user: any) {
        return this.adminService.getOrgUsers(user.organizationId);
    }

    /**
     * PATCH /admin/users/:id/role
     * Update a user's org-level role.
     */
    @Patch('users/:id/role')
    @Roles('root')
    @ApiOperation({ summary: 'Update user role (root only)' })
    updateRole(
        @Param('id') id: string,
        @Body('role') role: string,
        @CurrentUser() user: any,
    ) {
        return this.adminService.updateUserRole(id, role, user.organizationId);
    }

    /**
     * GET /admin/activity
     * Recent activity feed across the org.
     */
    @Get('activity')
    @ApiOperation({ summary: 'Get recent org-wide activity feed' })
    getActivity(@CurrentUser() user: any, @Query('limit') limit?: string) {
        return this.adminService.getRecentActivity(user.organizationId, limit ? parseInt(limit, 10) : 20);
    }
}
