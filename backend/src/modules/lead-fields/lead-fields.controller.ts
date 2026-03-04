import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { LeadFieldsService } from './lead-fields.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('lead-fields')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('lead-fields')
export class LeadFieldsController {
    constructor(private readonly leadFieldsService: LeadFieldsService) { }

    @ApiOperation({ summary: 'Get all lead field definitions' })
    @Get()
    async findAll(@CurrentUser() user: any) {
        const fields = await this.leadFieldsService.findAll(user.organizationId);
        if (fields.length === 0) {
            return this.leadFieldsService.seedDefaults(user.organizationId);
        }
        return fields;
    }

    @ApiOperation({ summary: 'Create a new lead field definition' })
    @Post()
    @Roles('admin', 'root')
    create(@Body() dto: any, @CurrentUser() user: any) {
        return this.leadFieldsService.create(dto, user.organizationId);
    }

    @ApiOperation({ summary: 'Update a lead field definition' })
    @Patch(':id')
    @Roles('admin', 'root')
    update(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: any) {
        return this.leadFieldsService.update(id, dto, user.organizationId);
    }

    @ApiOperation({ summary: 'Delete a lead field definition' })
    @Delete(':id')
    @Roles('admin', 'root')
    remove(@Param('id') id: string, @CurrentUser() user: any) {
        return this.leadFieldsService.remove(id, user.organizationId);
    }

    @ApiOperation({ summary: 'Seed default fields' })
    @Post('seed')
    @Roles('admin', 'root')
    seed(@CurrentUser() user: any) {
        return this.leadFieldsService.seedDefaults(user.organizationId);
    }
}
