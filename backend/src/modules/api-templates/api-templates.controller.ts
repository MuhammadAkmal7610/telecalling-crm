import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, UnauthorizedException } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiTemplatesService } from './api-templates.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateApiTemplateDto, UpdateApiTemplateDto } from './dto/api-template.dto';

@ApiTags('API Templates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api-templates')
export class ApiTemplatesController {
    constructor(private readonly apiTemplatesService: ApiTemplatesService) { }

    @Get()
    @ApiOperation({ summary: 'List all API outbound templates' })
    findAll(@CurrentUser() user: any) {
        if (!user.workspaceId) throw new UnauthorizedException('Workspace context required');
        return this.apiTemplatesService.findAll(user.organizationId, user.workspaceId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a single API template' })
    findOne(@Param('id') id: string, @CurrentUser() user: any) {
        return this.apiTemplatesService.findOne(id, user.organizationId, user.workspaceId);
    }

    @Post()
    @Roles('admin', 'root', 'manager')
    @ApiOperation({ summary: 'Create a new API template' })
    create(@Body() dto: CreateApiTemplateDto, @CurrentUser() user: any) {
        return this.apiTemplatesService.create(dto, user.organizationId, user.workspaceId, user.id);
    }

    @Patch(':id')
    @Roles('admin', 'root', 'manager')
    @ApiOperation({ summary: 'Update an existing API template' })
    update(@Param('id') id: string, @Body() dto: UpdateApiTemplateDto, @CurrentUser() user: any) {
        return this.apiTemplatesService.update(id, dto, user.organizationId, user.workspaceId);
    }

    @Delete(':id')
    @Roles('admin', 'root', 'manager')
    @ApiOperation({ summary: 'Remove an API template' })
    remove(@Param('id') id: string, @CurrentUser() user: any) {
        return this.apiTemplatesService.remove(id, user.organizationId, user.workspaceId);
    }
}
