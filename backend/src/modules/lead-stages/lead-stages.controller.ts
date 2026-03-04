import {
    Controller, Get, Post, Patch, Delete, Body, Param,
    UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LeadStagesService } from './lead-stages.service';
import {
    CreateLeadStageDto, UpdateLeadStageDto,
    CreateLostReasonDto, UpdateLostReasonDto,
} from './dto/lead-stage.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Lead Stages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('lead-stages')
export class LeadStagesController {
    constructor(private readonly leadStagesService: LeadStagesService) { }

    // ---added by akmal--─── Stages ─────────────────────────────────────────────────────────────

    @Post()
    @Roles('admin', 'root')
    @ApiOperation({ summary: 'Create a new lead stage' })
    create(@Body() dto: CreateLeadStageDto, @CurrentUser() user: any) {
        return this.leadStagesService.create(dto, user.organizationId, user.workspaceId);
    }

    @Get()
    @ApiOperation({ summary: 'Get all lead stages ordered by position' })
    findAll(@CurrentUser() user: any) {
        return this.leadStagesService.findAll(user.organizationId, user.workspaceId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a lead stage by ID' })
    findOne(@Param('id') id: string, @CurrentUser() user: any) {
        return this.leadStagesService.findOne(id, user.organizationId, user.workspaceId);
    }

    @Patch('reorder')
    @Roles('admin', 'root')
    @ApiOperation({ summary: 'Reorder stages by providing ordered array of IDs' })
    reorder(@Body() body: { stageIds: string[] }, @CurrentUser() user: any) {
        return this.leadStagesService.reorder(body.stageIds, user.organizationId, user.workspaceId);
    }

    @Patch(':id')
    @Roles('admin', 'root')
    @ApiOperation({ summary: 'Update a lead stage' })
    update(@Param('id') id: string, @Body() dto: UpdateLeadStageDto, @CurrentUser() user: any) {
        return this.leadStagesService.update(id, dto, user.organizationId, user.workspaceId);
    }

    @Delete(':id')
    @Roles('admin', 'root')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Delete a lead stage (non-default only)' })
    remove(@Param('id') id: string, @CurrentUser() user: any) {
        return this.leadStagesService.remove(id, user.organizationId, user.workspaceId);
    }

    // ---added by akmal--─── Lost Reasons ─────────────────────────────────────────────────────────

    @Get('lost-reasons')
    @ApiOperation({ summary: 'Get all lost reasons' })
    getLostReasons(@CurrentUser() user: any) {
        return this.leadStagesService.getLostReasons(user.organizationId, user.workspaceId);
    }

    @Post('lost-reasons')
    @Roles('admin', 'root')
    @ApiOperation({ summary: 'Add a lost reason' })
    createLostReason(@Body() dto: CreateLostReasonDto, @CurrentUser() user: any) {
        return this.leadStagesService.createLostReason(dto, user.organizationId, user.workspaceId);
    }

    @Patch('lost-reasons/:id')
    @Roles('admin', 'root')
    @ApiOperation({ summary: 'Update a lost reason' })
    updateLostReason(@Param('id') id: string, @Body() dto: UpdateLostReasonDto, @CurrentUser() user: any) {
        return this.leadStagesService.updateLostReason(id, dto, user.organizationId, user.workspaceId);
    }

    @Delete('lost-reasons/:id')
    @Roles('admin', 'root')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Delete a lost reason' })
    removeLostReason(@Param('id') id: string, @CurrentUser() user: any) {
        return this.leadStagesService.removeLostReason(id, user.organizationId, user.workspaceId);
    }
}
