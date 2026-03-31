import {
    Controller, Get, Post, Patch, Delete, Body, Param, Query,
    UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { InviteUserDto, UpdateUserDto, AssignLicenseDto, UserQueryDto } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserSettingsDto } from './dto/user-settings.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    /** GET /users/me — any authenticated user can view their own profile */
    @Get('me')
    @ApiOperation({ summary: 'Get current authenticated user profile' })
    getMe(@CurrentUser() user: any) {
        return this.usersService.getMe(user.id, user.organizationId);
    }

    /** PATCH /users/me — any authenticated user can update their own profile */
    @Patch('me')
    @ApiOperation({ summary: 'Update your own user profile or switch workspace' })
    updateMe(@CurrentUser() user: any, @Body() dto: { name?: string; phone?: string; initials?: string; workspace_id?: string }) {
        return this.usersService.updateMe(user.id, dto, user.organizationId);
    }

    /** GET /users/me/settings — fetch persisted user preferences */
    @Get('me/settings')
    @ApiOperation({ summary: 'Get current user settings' })
    getMySettings(@CurrentUser() user: any) {
        return this.usersService.getMySettings(user.id, user.organizationId);
    }

    /** PATCH /users/me/settings — update persisted user preferences */
    @Patch('me/settings')
    @ApiOperation({ summary: 'Update current user settings' })
    updateMySettings(@CurrentUser() user: any, @Body() dto: UserSettingsDto) {
        return this.usersService.updateMySettings(user.id, user.organizationId, dto);
    }

    /** GET /users/licenses/available — admin+ */
    @Get('licenses/available')
    @Roles('admin', 'root')
    @ApiOperation({ summary: 'List available (unassigned) licenses' })
    getAvailableLicenses(@CurrentUser() user: any) {
        return this.usersService.getAvailableLicenses(user.organizationId);
    }

    /** GET /users — manager+ can see the team list */
    @Get()
    @Roles('manager', 'admin', 'root')
    @ApiOperation({ summary: 'List all team members' })
    findAll(@Query() query: UserQueryDto, @CurrentUser() user: any) {
        return this.usersService.findAll(query, user.organizationId);
    }

    /** GET /users/:id — manager+ */
    @Get(':id')
    @Roles('manager', 'admin', 'root')
    @ApiOperation({ summary: 'Get a user by ID' })
    findOne(@Param('id') id: string, @CurrentUser() user: any) {
        return this.usersService.findOne(id, user.organizationId);
    }

    /** GET /users/:id/activity — manager+ */
    @Get(':id/activity')
    @Roles('manager', 'admin', 'root')
    @ApiOperation({ summary: 'Get activity logs for a specific user' })
    getUserActivity(@Param('id') id: string, @CurrentUser() user: any) {
        return this.usersService.getUserActivity(id, user.organizationId);
    }

    /** POST /users/invite — admin+ only */
    @Post('invite')
    @Roles('admin', 'root')
    @ApiOperation({ summary: 'Invite a new user to the organization (admin only)' })
    invite(@Body() dto: InviteUserDto, @CurrentUser() user: any) {
        return this.usersService.invite(dto, user.id, user.organizationId);
    }

    /** PATCH /users/:id — admin+ can update roles, status, permissions */
    @Patch(':id')
    @Roles('admin', 'root')
    @ApiOperation({ summary: 'Update a user profile or role (admin only)' })
    update(@Param('id') id: string, @Body() dto: UpdateUserDto, @CurrentUser() user: any) {
        return this.usersService.update(id, dto, user.organizationId);
    }

    /** DELETE /users/:id — admin+ only, soft-deletes & disables auth */
    @Delete(':id')
    @Roles('admin', 'root')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Remove (soft-delete) a user (admin only)' })
    remove(@Param('id') id: string, @CurrentUser() user: any) {
        return this.usersService.remove(id, user.organizationId);
    }

    /** POST /users/licenses/assign — admin+ */
    @Post('licenses/assign')
    @Roles('admin', 'root')
    @ApiOperation({ summary: 'Assign a license to a user (admin only)' })
    assignLicense(@Body() dto: AssignLicenseDto, @CurrentUser() user: any) {
        return this.usersService.assignLicense(dto, user.organizationId);
    }
}
