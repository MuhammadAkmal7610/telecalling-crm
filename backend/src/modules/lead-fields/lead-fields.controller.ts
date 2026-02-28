import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { LeadFieldsService } from './lead-fields.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('lead-fields')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('lead-fields')
export class LeadFieldsController {
    constructor(private readonly leadFieldsService: LeadFieldsService) { }

    @ApiOperation({ summary: 'Get all lead field definitions' })
    @Get()
    async findAll(@Request() req: any) {
        const fields = await this.leadFieldsService.findAll(req.user.organizationId);
        if (fields.length === 0) {
            return this.leadFieldsService.seedDefaults(req.user.organizationId);
        }
        return fields;
    }

    @ApiOperation({ summary: 'Create a new lead field definition' })
    @Post()
    create(@Body() dto: any, @Request() req: any) {
        return this.leadFieldsService.create(dto, req.user.organizationId);
    }

    @ApiOperation({ summary: 'Update a lead field definition' })
    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: any, @Request() req: any) {
        return this.leadFieldsService.update(id, dto, req.user.organizationId);
    }

    @ApiOperation({ summary: 'Delete a lead field definition' })
    @Delete(':id')
    remove(@Param('id') id: string, @Request() req: any) {
        return this.leadFieldsService.remove(id, req.user.organizationId);
    }

    @ApiOperation({ summary: 'Seed default fields' })
    @Post('seed')
    seed(@Request() req: any) {
        return this.leadFieldsService.seedDefaults(req.user.organizationId);
    }
}
