import {
    Controller, Get, Post, Patch, Delete, Body, Param, Query,
    UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LeadsService } from './leads.service';
import { CreateLeadDto, UpdateLeadDto, LeadQueryDto, LeadStatus } from './dto/lead.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Leads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('leads')
export class LeadsController {
    constructor(private readonly leadsService: LeadsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new lead' })
    create(@Body() dto: CreateLeadDto, @CurrentUser() user: any) {
        return this.leadsService.create(dto, user);
    }

    @Get()
    @ApiOperation({ summary: 'List all leads with filtering, search & pagination' })
    findAll(@Query() query: LeadQueryDto, @CurrentUser() user: any) {
        return this.leadsService.findAll(query, user.workspaceId);
    }

    @Get('stats')
    @ApiOperation({ summary: 'Get lead counts grouped by status' })
    getStats(@CurrentUser() user: any) {
        return this.leadsService.getStats(user.workspaceId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a single lead by ID' })
    findOne(@Param('id') id: string, @CurrentUser() user: any) {
        return this.leadsService.findOne(id, user.workspaceId);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a lead' })
    update(@Param('id') id: string, @Body() dto: UpdateLeadDto, @CurrentUser() user: any) {
        return this.leadsService.update(id, dto, user.workspaceId);
    }

    @Patch(':id/status')
    @ApiOperation({ summary: 'Update lead status (with optional lost reason)' })
    updateStatus(
        @Param('id') id: string,
        @Body() body: { status: LeadStatus; lostReason?: string },
        @CurrentUser() user: any
    ) {
        return this.leadsService.updateStatus(id, body.status, user.workspaceId, body.lostReason);
    }

    @Patch(':id/assign')
    @Roles('manager', 'admin', 'root')
    @ApiOperation({ summary: 'Assign lead to a user' })
    assign(@Param('id') id: string, @Body() body: { assigneeId: string }, @CurrentUser() user: any) {
        return this.leadsService.assignLead(id, body.assigneeId, user.workspaceId);
    }

    @Patch('bulk-assign')
    @Roles('manager', 'admin', 'root')
    @ApiOperation({ summary: 'Bulk assign leads to a user' })
    bulkAssign(@Body() body: { leadIds: string[]; assigneeId: string }, @CurrentUser() user: any) {
        return this.leadsService.bulkAssign(body.leadIds, body.assigneeId, user.workspaceId);
    }

    @Delete(':id')
    @Roles('manager', 'admin', 'root')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Delete a lead' })
    remove(@Param('id') id: string, @CurrentUser() user: any) {
        return this.leadsService.remove(id, user.workspaceId);
    }

    @Post('bulk-import')
    @ApiOperation({ summary: 'Bulk import leads from CSV/Excel data' })
    bulkImport(@Body() body: { leads: CreateLeadDto[] }, @CurrentUser() user: any) {
        return this.leadsService.bulkImport(body.leads, user);
    }

    @Get('duplicates')
    @Roles('manager', 'admin', 'root')
    @ApiOperation({ summary: 'Get groups of duplicate leads by phone or email' })
    getDuplicates(@Query('type') type: 'phone' | 'email', @CurrentUser() user: any) {
        return this.leadsService.getDuplicates(user.workspaceId, type || 'phone');
    }
}
