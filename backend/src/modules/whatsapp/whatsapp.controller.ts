import { Controller, Post, Get, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WhatsAppService } from './whatsapp.service';
import { 
  CreateWhatsAppCampaignDto, 
  UpdateWhatsAppCampaignDto, 
  WhatsAppCampaignQueryDto,
  CreateWhatsAppDripSequenceDto,
  UpdateWhatsAppDripSequenceDto,
  CreateWhatsAppTemplateDto,
  UpdateWhatsAppTemplateDto,
  CreateWhatsAppAutomationRuleDto,
  UpdateWhatsAppAutomationRuleDto,
  WhatsAppAnalyticsQueryDto
} from './dto/whatsapp-campaign.dto';

@ApiTags('WhatsApp')
@Controller('whatsapp')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WhatsAppController {
  constructor(private readonly whatsappService: WhatsAppService) {}

  // === CAMPAIGN MANAGEMENT ENDPOINTS ===

  @Post('campaigns')
  @ApiOperation({ summary: 'Create a new WhatsApp campaign' })
  @ApiResponse({ status: 201, description: 'Campaign created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createCampaign(
    @Body() createCampaignDto: CreateWhatsAppCampaignDto,
    @Req() req: any
  ) {
    return this.whatsappService.createCampaign(createCampaignDto, req.user);
  }

  @Get('campaigns')
  @ApiOperation({ summary: 'Get all WhatsApp campaigns' })
  @ApiResponse({ status: 200, description: 'Campaigns retrieved successfully' })
  async getCampaigns(
    @Query() query: WhatsAppCampaignQueryDto,
    @Req() req: any
  ) {
    return this.whatsappService.getCampaigns(query, req.user);
  }

  @Get('campaigns/:id')
  @ApiOperation({ summary: 'Get a specific WhatsApp campaign' })
  @ApiResponse({ status: 200, description: 'Campaign retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async getCampaign(
    @Param('id') id: string,
    @Req() req: any
  ) {
    return this.whatsappService.getCampaign(id, req.user);
  }

  @Put('campaigns/:id')
  @ApiOperation({ summary: 'Update a WhatsApp campaign' })
  @ApiResponse({ status: 200, description: 'Campaign updated successfully' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async updateCampaign(
    @Param('id') id: string,
    @Body() updateCampaignDto: UpdateWhatsAppCampaignDto,
    @Req() req: any
  ) {
    return this.whatsappService.updateCampaign(id, updateCampaignDto, req.user);
  }

  @Delete('campaigns/:id')
  @ApiOperation({ summary: 'Delete a WhatsApp campaign' })
  @ApiResponse({ status: 200, description: 'Campaign deleted successfully' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async deleteCampaign(
    @Param('id') id: string,
    @Req() req: any
  ) {
    return this.whatsappService.deleteCampaign(id, req.user);
  }

  @Post('campaigns/:id/run')
  @ApiOperation({ summary: 'Run a WhatsApp campaign' })
  @ApiResponse({ status: 200, description: 'Campaign execution started' })
  @ApiResponse({ status: 400, description: 'Campaign cannot be run' })
  async runCampaign(
    @Param('id') id: string,
    @Req() req: any
  ) {
    return this.whatsappService.runCampaign(id, req.user);
  }

  @Get('campaigns/:id/analytics')
  @ApiOperation({ summary: 'Get campaign analytics' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async getCampaignAnalytics(
    @Param('id') id: string,
    @Req() req: any
  ) {
    return this.whatsappService.getCampaignAnalytics(id, req.user);
  }

  // === DRIP SEQUENCE ENDPOINTS ===

  @Post('drip-sequences')
  @ApiOperation({ summary: 'Create a new drip sequence' })
  @ApiResponse({ status: 201, description: 'Drip sequence created successfully' })
  async createDripSequence(
    @Body() createDripSequenceDto: CreateWhatsAppDripSequenceDto,
    @Req() req: any
  ) {
    return this.whatsappService.createDripSequence(createDripSequenceDto, req.user);
  }

  @Get('drip-sequences')
  @ApiOperation({ summary: 'Get all drip sequences' })
  @ApiResponse({ status: 200, description: 'Drip sequences retrieved successfully' })
  async getDripSequences(@Req() req: any) {
    // Implementation would go here
    return { message: 'Drip sequences endpoint - implementation needed' };
  }

  @Put('drip-sequences/:id')
  @ApiOperation({ summary: 'Update a drip sequence' })
  @ApiResponse({ status: 200, description: 'Drip sequence updated successfully' })
  async updateDripSequence(
    @Param('id') id: string,
    @Body() updateDripSequenceDto: UpdateWhatsAppDripSequenceDto,
    @Req() req: any
  ) {
    // Implementation would go here
    return { message: 'Update drip sequence endpoint - implementation needed' };
  }

  @Delete('drip-sequences/:id')
  @ApiOperation({ summary: 'Delete a drip sequence' })
  @ApiResponse({ status: 200, description: 'Drip sequence deleted successfully' })
  async deleteDripSequence(
    @Param('id') id: string,
    @Req() req: any
  ) {
    // Implementation would go here
    return { message: 'Delete drip sequence endpoint - implementation needed' };
  }

  @Post('drip-sequences/:sequenceId/enroll/:leadId')
  @ApiOperation({ summary: 'Enroll a lead in a drip sequence' })
  @ApiResponse({ status: 201, description: 'Lead enrolled successfully' })
  @ApiResponse({ status: 400, description: 'Lead already enrolled or invalid request' })
  async enrollLeadInDripSequence(
    @Param('sequenceId') sequenceId: string,
    @Param('leadId') leadId: string,
    @Req() req: any
  ) {
    return this.whatsappService.enrollLeadInDripSequence(sequenceId, leadId, 'manual', req.user);
  }

  // === TEMPLATE MANAGEMENT ENDPOINTS ===

  @Post('templates')
  @ApiOperation({ summary: 'Create a new WhatsApp template' })
  @ApiResponse({ status: 201, description: 'Template created successfully' })
  async createTemplate(
    @Body() createTemplateDto: CreateWhatsAppTemplateDto,
    @Req() req: any
  ) {
    return this.whatsappService.createTemplate(createTemplateDto, req.user);
  }

  @Get('templates')
  @ApiOperation({ summary: 'Get all WhatsApp templates' })
  @ApiResponse({ status: 200, description: 'Templates retrieved successfully' })
  async getTemplates(@Req() req: any) {
    return this.whatsappService.getTemplates(req.user);
  }

  @Put('templates/:id')
  @ApiOperation({ summary: 'Update a WhatsApp template' })
  @ApiResponse({ status: 200, description: 'Template updated successfully' })
  async updateTemplate(
    @Param('id') id: string,
    @Body() updateTemplateDto: UpdateWhatsAppTemplateDto,
    @Req() req: any
  ) {
    // Implementation would go here
    return { message: 'Update template endpoint - implementation needed' };
  }

  @Delete('templates/:id')
  @ApiOperation({ summary: 'Delete a WhatsApp template' })
  @ApiResponse({ status: 200, description: 'Template deleted successfully' })
  async deleteTemplate(
    @Param('id') id: string,
    @Req() req: any
  ) {
    // Implementation would go here
    return { message: 'Delete template endpoint - implementation needed' };
  }

  @Post('templates/sync')
  @ApiOperation({ summary: 'Sync templates from Meta' })
  @ApiResponse({ status: 200, description: 'Templates synced successfully' })
  async syncTemplatesFromMeta(@Req() req: any) {
    return this.whatsappService.syncTemplatesFromMeta(req.user);
  }

  // === AUTOMATION RULE ENDPOINTS ===

  @Post('automation-rules')
  @ApiOperation({ summary: 'Create a new automation rule' })
  @ApiResponse({ status: 201, description: 'Automation rule created successfully' })
  async createAutomationRule(
    @Body() createAutomationRuleDto: CreateWhatsAppAutomationRuleDto,
    @Req() req: any
  ) {
    return this.whatsappService.createAutomationRule(createAutomationRuleDto, req.user);
  }

  @Get('automation-rules')
  @ApiOperation({ summary: 'Get all automation rules' })
  @ApiResponse({ status: 200, description: 'Automation rules retrieved successfully' })
  async getAutomationRules(@Req() req: any) {
    // Implementation would go here
    return { message: 'Get automation rules endpoint - implementation needed' };
  }

  @Put('automation-rules/:id')
  @ApiOperation({ summary: 'Update an automation rule' })
  @ApiResponse({ status: 200, description: 'Automation rule updated successfully' })
  async updateAutomationRule(
    @Param('id') id: string,
    @Body() updateAutomationRuleDto: UpdateWhatsAppAutomationRuleDto,
    @Req() req: any
  ) {
    // Implementation would go here
    return { message: 'Update automation rule endpoint - implementation needed' };
  }

  @Delete('automation-rules/:id')
  @ApiOperation({ summary: 'Delete an automation rule' })
  @ApiResponse({ status: 200, description: 'Automation rule deleted successfully' })
  async deleteAutomationRule(
    @Param('id') id: string,
    @Req() req: any
  ) {
    // Implementation would go here
    return { message: 'Delete automation rule endpoint - implementation needed' };
  }

  @Post('automation-rules/:ruleId/execute/:leadId')
  @ApiOperation({ summary: 'Execute an automation rule for a lead' })
  @ApiResponse({ status: 200, description: 'Automation rule executed successfully' })
  @ApiResponse({ status: 400, description: 'Rule not found or inactive' })
  async executeAutomationRule(
    @Param('ruleId') ruleId: string,
    @Param('leadId') leadId: string,
    @Body() eventData: any,
    @Req() req: any
  ) {
    return this.whatsappService.executeAutomationRule(ruleId, leadId, eventData, req.user);
  }

  // === ANALYTICS ENDPOINTS ===

  @Get('analytics')
  @ApiOperation({ summary: 'Get WhatsApp analytics' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  async getAnalytics(
    @Query() query: WhatsAppAnalyticsQueryDto,
    @Req() req: any
  ) {
    // Implementation would go here
    return { message: 'Analytics endpoint - implementation needed' };
  }

  // === EXISTING ENDPOINTS ===

  @Post('messages')
  @ApiOperation({ summary: 'Send a WhatsApp message' })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request or WhatsApp not configured' })
  async sendMessage(
    @Body() messageData: any,
    @Req() req: any
  ) {
    return this.whatsappService.sendMessage(messageData, req.user);
  }

  @Get('messages/:leadId')
  @ApiOperation({ summary: 'Get messages for a lead' })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully' })
  async getMessages(
    @Param('leadId') leadId: string,
    @Req() req: any
  ) {
    return this.whatsappService.getMessages(leadId, req.user);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Get WhatsApp conversations' })
  @ApiResponse({ status: 200, description: 'Conversations retrieved successfully' })
  async getConversations(
    @Req() req: any,
    @Query('status') status?: string
  ) {
    return this.whatsappService.getConversations(req.user, status);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Handle WhatsApp webhook' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async handleWebhook(@Body() webhookData: any) {
    return this.whatsappService.handleWebhook(webhookData);
  }

  @Get('webhook')
  @ApiOperation({ summary: 'Verify WhatsApp webhook' })
  @ApiResponse({ status: 200, description: 'Webhook verified successfully' })
  async verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.token') token: string,
    @Query('hub.challenge') challenge: string
  ) {
    return this.whatsappService.verifyWebhook(mode, token, challenge);
  }
}