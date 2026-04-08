import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put } from '@nestjs/common';
import { PipelineService } from './pipeline.service';
import { CreatePipelineDto, UpdatePipelineDto } from './dto/pipeline.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Pipeline')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pipeline')
export class PipelineController {
    constructor(private readonly pipelineService: PipelineService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new pipeline' })
    create(@Body() dto: CreatePipelineDto, @CurrentUser() user: any) {
        return this.pipelineService.create(
            dto,
            user.organizationId,
            user.workspaceId
        );
    }

    @Get()
    @ApiOperation({ summary: 'Get all pipelines for workspace' })
    findAll(@CurrentUser() user: any) {
        return this.pipelineService.findAll(
            user.organizationId,
            user.workspaceId
        );
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a specific pipeline' })
    findOne(@Param('id') id: string, @CurrentUser() user: any) {
        return this.pipelineService.findOne(
            id,
            user.organizationId,
            user.workspaceId
        );
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a pipeline' })
    update(@Param('id') id: string, @Body() dto: UpdatePipelineDto, @CurrentUser() user: any) {
        return this.pipelineService.update(
            id,
            dto,
            user.organizationId,
            user.workspaceId
        );
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a pipeline' })
    remove(@Param('id') id: string, @CurrentUser() user: any) {
        return this.pipelineService.remove(
            id,
            user.organizationId,
            user.workspaceId
        );
    }

    @Put('reorder')
    @ApiOperation({ summary: 'Reorder pipelines' })
    reorder(@Body('pipelineIds') pipelineIds: string[], @CurrentUser() user: any) {
        return this.pipelineService.reorder(
            pipelineIds,
            user.organizationId,
            user.workspaceId
        );
    }
}
