import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { WorkflowsService } from './workflows.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Workflows')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('workflows')
export class WorkflowsController {
    constructor(private readonly workflowsService: WorkflowsService) { }

    @Get()
    @ApiOperation({ summary: 'List all automation workflows' })
    findAll(@CurrentUser() user: any) {
        return this.workflowsService.findAll(user.organizationId, user.workspaceId);
    }

    @Post()
    @Roles('admin', 'root', 'manager')
    @ApiOperation({ summary: 'Create a new workflow automation' })
    create(
        @Body() workflowData: any,
        @CurrentUser() user: any
    ) {
        return this.workflowsService.create(workflowData, user.organizationId, user.workspaceId);
    }

    @Patch(':id')
    @Roles('admin', 'root', 'manager')
    @ApiOperation({ summary: 'Update a workflow' })
    update(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: any) {
        return this.workflowsService.update(id, user.organizationId, user.workspaceId, dto);
    }

    @Post('test')
    @ApiOperation({ summary: 'Test workflow execution' })
    async test(@Body() workflowData: any) {
        return this.workflowsService.testWorkflow(workflowData);
    }

    @Delete(':id')
    @Roles('admin', 'root', 'manager')
    @ApiOperation({ summary: 'Delete a workflow' })
    remove(@Param('id') id: string, @CurrentUser() user: any) {
        return this.workflowsService.remove(id, user.organizationId, user.workspaceId);
    }
}
