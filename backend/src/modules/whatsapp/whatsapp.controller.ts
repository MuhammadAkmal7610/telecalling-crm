import { Controller, Post, Get, Body, Query, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WhatsAppService, WhatsAppMessage } from './whatsapp.service';

@ApiTags('WhatsApp')
@Controller('whatsapp')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WhatsAppController {
  constructor(private readonly whatsappService: WhatsAppService) {}

  @Post('send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send WhatsApp message' })
  async sendMessage(@Body() messageData: Partial<WhatsAppMessage>, @Req() req: any) {
    return this.whatsappService.sendMessage(messageData, req.user);
  }

  @Post('send-template')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send WhatsApp template message' })
  async sendTemplateMessage(
    @Body() body: { to: string; templateName: string; variables: Record<string, any> },
    @Req() req: any
  ) {
    return this.whatsappService.sendTemplateMessage(
      body.to,
      body.templateName,
      body.variables,
      req.user
    );
  }

  @Get('webhook')
  @ApiOperation({ summary: 'Verify WhatsApp webhook' })
  async verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ) {
    return this.whatsappService.verifyWebhook(mode, token, challenge);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle WhatsApp webhook' })
  async handleWebhook(@Body() webhookData: any) {
    return this.whatsappService.handleWebhook(webhookData);
  }

  @Get('messages/:leadId')
  @ApiOperation({ summary: 'Get WhatsApp messages for a lead' })
  async getMessages(@Query('leadId') leadId: string, @Req() req: any) {
    return this.whatsappService.getMessages(leadId, req.user);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Get WhatsApp conversations' })
  async getConversations(@Req() req: any, @Query('status') status?: string) {
    return this.whatsappService.getConversations(req.user, status);
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get WhatsApp analytics' })
  async getAnalytics(@Req() req: any, @Query('timeRange') timeRange?: string) {
    return this.whatsappService.getAnalytics(req.user.workspace_id, timeRange);
  }
}
