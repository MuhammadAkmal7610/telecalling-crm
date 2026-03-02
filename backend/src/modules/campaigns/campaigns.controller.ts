import {
    Controller, Get, Post, Patch, Delete, Body, Param, Query,
    UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto, UpdateCampaignDto, CampaignQueryDto } from './dto/campaign.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Campaigns')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('campaigns')
export class CampaignsController {
    constructor(private readonly campaignsService: CampaignsService) { }

    @Post()
    @Roles('admin', 'manager', 'root')
    @ApiOperation({ summary: 'Create a new campaign' })
    create(@Body() dto: CreateCampaignDto, @CurrentUser() user: any) {
        return this.campaignsService.create(dto, user.id, user.workspaceId, user.organizationId);
    }

    @Get()
    @ApiOperation({ summary: 'List campaigns' })
    findAll(@Query() query: CampaignQueryDto, @CurrentUser() user: any) {
        return this.campaignsService.findAll(query, user.workspaceId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get campaign details' })
    findOne(@Param('id') id: string, @CurrentUser() user: any) {
        return this.campaignsService.findOne(id, user.workspaceId);
    }

    @Patch(':id')
    @Roles('admin', 'manager', 'root')
    @ApiOperation({ summary: 'Update campaign' })
    update(@Param('id') id: string, @Body() dto: UpdateCampaignDto, @CurrentUser() user: any) {
        return this.campaignsService.update(id, dto, user.workspaceId);
    }

    @Delete(':id')
    @Roles('admin', 'manager', 'root')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Close/Delete campaign' })
    remove(@Param('id') id: string, @CurrentUser() user: any) {
        return this.campaignsService.remove(id, user.workspaceId);
    }

    @Get(':id/stats')
    @ApiOperation({ summary: 'Get campaign-specific stats' })
    getStats(@Param('id') id: string, @CurrentUser() user: any) {
        return this.campaignsService.getStats(id, user.workspaceId);
    }
}
