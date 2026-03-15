import { Controller, Get, Post, Put, Delete, Query, Body, Param, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EmailService } from './email.service';

@ApiTags('Email')
@Controller('email')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  // ==================== TEMPLATES ====================

  @Post('templates')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create email template' })
  async createTemplate(@Body() templateData: any, @Req() req: any) {
    return this.emailService.createTemplate(templateData, req.user);
  }

  @Get('templates')
  @ApiOperation({ summary: 'Get email templates' })
  async getTemplates(@Req() req: any, @Query('category') category?: string) {
    return this.emailService.getTemplates(req.user, category);
  }

  @Put('templates/:id')
  @ApiOperation({ summary: 'Update email template' })
  async updateTemplate(@Param('id') id: string, @Body() templateData: any, @Req() req: any) {
    return this.emailService.updateTemplate(id, templateData, req.user);
  }

  @Delete('templates/:id')
  @ApiOperation({ summary: 'Delete email template' })
  async deleteTemplate(@Param('id') id: string, @Req() req: any) {
    return this.emailService.deleteTemplate(id, req.user);
  }

  // ==================== CAMPAIGNS ====================

  @Post('campaigns')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create email campaign' })
  async createCampaign(@Body() campaignData: any, @Req() req: any) {
    return this.emailService.createCampaign(campaignData, req.user);
  }

  @Get('campaigns')
  @ApiOperation({ summary: 'Get email campaigns' })
  async getCampaigns(@Req() req: any, @Query('status') status?: string) {
    return this.emailService.getCampaigns(req.user, status);
  }

  @Post('campaigns/:id/execute')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Execute email campaign' })
  async executeCampaign(@Param('id') id: string, @Req() req: any) {
    return this.emailService.executeCampaign(id, req.user);
  }

  @Get('campaigns/:id/analytics')
  @ApiOperation({ summary: 'Get campaign analytics' })
  async getCampaignAnalytics(@Param('id') id: string, @Req() req: any) {
    return this.emailService.getCampaignAnalytics(id, req.user);
  }

  // ==================== AUTOMATION ====================

  @Post('automation')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create email automation' })
  async createAutomation(@Body() automationData: any, @Req() req: any) {
    return this.emailService.createAutomation(automationData, req.user);
  }

  @Get('automation')
  @ApiOperation({ summary: 'Get email automations' })
  async getAutomations(@Req() req: any) {
    return this.emailService.getAutomations(req.user);
  }

  @Post('automation/:id/trigger')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Trigger email automation' })
  async triggerAutomation(@Param('id') id: string, @Body() triggerData: any, @Req() req: any) {
    return this.emailService.triggerAutomation(id, triggerData, req.user);
  }

  // ==================== DRIP CAMPAIGNS ====================

  @Post('drip-campaigns')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create drip campaign' })
  async createDripCampaign(@Body() campaignData: any, @Req() req: any) {
    return this.emailService.createDripCampaign(campaignData, req.user);
  }

  @Get('drip-campaigns')
  @ApiOperation({ summary: 'Get drip campaigns' })
  async getDripCampaigns(@Req() req: any) {
    return this.emailService.getDripCampaigns(req.user);
  }

  @Put('drip-campaigns/:id')
  @ApiOperation({ summary: 'Update drip campaign' })
  async updateDripCampaign(@Param('id') id: string, @Body() campaignData: any, @Req() req: any) {
    return this.emailService.updateDripCampaign(id, campaignData, req.user);
  }

  @Delete('drip-campaigns/:id')
  @ApiOperation({ summary: 'Delete drip campaign' })
  async deleteDripCampaign(@Param('id') id: string, @Req() req: any) {
    return this.emailService.deleteDripCampaign(id, req.user);
  }

  @Post('drip-campaigns/:id/enroll')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enroll lead in drip campaign' })
  async enrollInDripCampaign(@Param('id') id: string, @Body('leadId') leadId: string, @Req() req: any) {
    return this.emailService.enrollInDripCampaign(id, leadId, req.user);
  }

  // ==================== ANALYTICS ====================

  @Get('analytics')
  @ApiOperation({ summary: 'Get email analytics' })
  async getEmailAnalytics(@Req() req: any, @Query('timeRange') timeRange?: string) {
    return this.emailService.getEmailAnalytics(req.user, timeRange);
  }

  // ==================== WEBHOOKS ====================

  @Post('webhooks/sendgrid')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle SendGrid webhook events' })
  async handleSendGridWebhook(@Body() webhookData: any) {
    // Handle SendGrid events (delivered, opened, clicked, bounced, etc.)
    return { status: 'success' };
  }

  @Post('webhooks/ses')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle AWS SES webhook events' })
  async handleSESWebhook(@Body() webhookData: any) {
    // Handle SES events (delivered, bounced, complained, etc.)
    return { status: 'success' };
  }
}
