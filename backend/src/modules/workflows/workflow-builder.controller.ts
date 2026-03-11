import { Controller, Get, Post, Put, Delete, Query, Body, Param, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkflowBuilderService } from './workflow-builder.service';

@ApiTags('Workflow Builder')
@Controller('workflows')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WorkflowBuilderController {
  constructor(private readonly workflowBuilderService: WorkflowBuilderService) {}

  // ==================== WORKFLOW DEFINITIONS ====================

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create workflow' })
  async createWorkflow(@Body() workflowData: any, @Req() req: any) {
    return this.workflowBuilderService.createWorkflow(workflowData, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Get workflows' })
  async getWorkflows(
    @Req() req: any,
    @Query('category') category?: string,
    @Query('status') status?: string
  ) {
    return this.workflowBuilderService.getWorkflows(req.user, category, status);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update workflow' })
  async updateWorkflow(@Param('id') id: string, @Body() workflowData: any, @Req() req: any) {
    return this.workflowBuilderService.updateWorkflow(id, workflowData, req.user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete workflow' })
  async deleteWorkflow(@Param('id') id: string, @Req() req: any) {
    return this.workflowBuilderService.deleteWorkflow(id, req.user);
  }

  // ==================== WORKFLOW EXECUTION ====================

  @Post(':id/execute')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Execute workflow' })
  async executeWorkflow(@Param('id') id: string, @Body() triggerData: any, @Req() req: any) {
    return this.workflowBuilderService.executeWorkflow(id, triggerData, req.user);
  }

  // ==================== WORKFLOW TEMPLATES ====================

  @Get('templates')
  @ApiOperation({ summary: 'Get workflow templates' })
  async getTemplates(@Query('category') category?: string) {
    return this.workflowBuilderService.getTemplates(category);
  }

  @Post(':id/template')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create template from workflow' })
  async createTemplateFromWorkflow(@Param('id') id: string, @Body() templateData: any, @Req() req: any) {
    return this.workflowBuilderService.createTemplateFromWorkflow(id, templateData, req.user);
  }

  // ==================== SCHEDULED WORKFLOWS ====================

  @Post(':id/schedule')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Schedule workflow' })
  async scheduleWorkflow(@Param('id') id: string, @Body() scheduleData: any, @Req() req: any) {
    return this.workflowBuilderService.scheduleWorkflow(id, scheduleData, req.user);
  }

  // ==================== ANALYTICS ====================

  @Get(':id/analytics')
  @ApiOperation({ summary: 'Get workflow analytics' })
  async getWorkflowAnalytics(@Param('id') id: string, @Req() req: any) {
    return this.workflowBuilderService.getWorkflowAnalytics(id, req.user);
  }

  // ==================== WEBHOOKS ====================

  @Post('webhooks/:workflowId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle workflow webhook' })
  async handleWorkflowWebhook(@Param('workflowId') workflowId: string, @Body() webhookData: any) {
    return this.workflowBuilderService.executeWorkflow(workflowId, webhookData);
  }
}
