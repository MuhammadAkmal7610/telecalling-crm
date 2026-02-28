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

@ApiTags('Lead Stages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('lead-stages')
export class LeadStagesController {
    constructor(private readonly leadStagesService: LeadStagesService) { }

    // ---added by akmal--─── Stages ─────────────────────────────────────────────────────────────

    @Post()
    @ApiOperation({ summary: 'Create a new lead stage' })
    create(@Body() dto: CreateLeadStageDto, @CurrentUser() user: any) {
        return this.leadStagesService.create(dto, user.organizationId);
    }

    @Get()
    @ApiOperation({ summary: 'Get all lead stages ordered by position' })
    findAll(@CurrentUser() user: any) {
        return this.leadStagesService.findAll(user.organizationId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a lead stage by ID' })
    findOne(@Param('id') id: string, @CurrentUser() user: any) {
        return this.leadStagesService.findOne(id, user.organizationId);
    }

    @Patch('reorder')
    @ApiOperation({ summary: 'Reorder stages by providing ordered array of IDs' })
    reorder(@Body() body: { stageIds: string[] }, @CurrentUser() user: any) {
        return this.leadStagesService.reorder(body.stageIds, user.organizationId);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a lead stage' })
    update(@Param('id') id: string, @Body() dto: UpdateLeadStageDto, @CurrentUser() user: any) {
        return this.leadStagesService.update(id, dto, user.organizationId);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Delete a lead stage (non-default only)' })
    remove(@Param('id') id: string, @CurrentUser() user: any) {
        return this.leadStagesService.remove(id, user.organizationId);
    }

    // ---added by akmal--─── Lost Reasons ─────────────────────────────────────────────────────────

    @Get('lost-reasons')
    @ApiOperation({ summary: 'Get all lost reasons' })
    getLostReasons(@CurrentUser() user: any) {
        return this.leadStagesService.getLostReasons(user.organizationId);
    }

    @Post('lost-reasons')
    @ApiOperation({ summary: 'Add a lost reason' })
    createLostReason(@Body() dto: CreateLostReasonDto, @CurrentUser() user: any) {
        return this.leadStagesService.createLostReason(dto, user.organizationId);
    }

    @Patch('lost-reasons/:id')
    @ApiOperation({ summary: 'Update a lost reason' })
    updateLostReason(@Param('id') id: string, @Body() dto: UpdateLostReasonDto, @CurrentUser() user: any) {
        return this.leadStagesService.updateLostReason(id, dto, user.organizationId);
    }

    @Delete('lost-reasons/:id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Delete a lost reason' })
    removeLostReason(@Param('id') id: string, @CurrentUser() user: any) {
        return this.leadStagesService.removeLostReason(id, user.organizationId);
    }
}
