import {
    Controller, Get, Post, Patch, Delete, Body, Param, Query,
    UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { InviteUserDto, UpdateUserDto, AssignLicenseDto, UserQueryDto } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('me')
    @ApiOperation({ summary: 'Get current authenticated user profile' })
    getMe(@CurrentUser() user: any) {
        return this.usersService.getMe(user.id, user.organizationId);
    }

    @Get('licenses/available')
    @ApiOperation({ summary: 'List available (unassigned) licenses' })
    getAvailableLicenses(@CurrentUser() user: any) {
        return this.usersService.getAvailableLicenses(user.organizationId);
    }

    @Get()
    @ApiOperation({ summary: 'List all team members' })
    findAll(@Query() query: UserQueryDto, @CurrentUser() user: any) {
        return this.usersService.findAll(query, user.organizationId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a user by ID' })
    findOne(@Param('id') id: string, @CurrentUser() user: any) {
        return this.usersService.findOne(id, user.organizationId);
    }

    @Post('invite')
    @ApiOperation({ summary: 'Invite a new user (sends email invitation)' })
    invite(@Body() dto: InviteUserDto, @CurrentUser() user: any) {
        return this.usersService.invite(dto, user.id, user.organizationId);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a user profile or role' })
    update(@Param('id') id: string, @Body() dto: UpdateUserDto, @CurrentUser() user: any) {
        return this.usersService.update(id, dto, user.organizationId);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Remove (soft-delete) a user' })
    remove(@Param('id') id: string, @CurrentUser() user: any) {
        return this.usersService.remove(id, user.organizationId);
    }

    @Post('licenses/assign')
    @ApiOperation({ summary: 'Assign a license to a user' })
    assignLicense(@Body() dto: AssignLicenseDto, @CurrentUser() user: any) {
        return this.usersService.assignLicense(dto, user.organizationId);
    }
}
