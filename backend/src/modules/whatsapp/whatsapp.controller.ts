import { Controller, Post, Get, Body, Query, Param, UseGuards, Req, HttpCode, HttpStatus, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WhatsAppService, WhatsAppMessage } from './whatsapp.service';

@ApiTags('WhatsApp')
@Controller('whatsapp')
@ApiBearerAuth()
export class WhatsAppController {
  constructor(private readonly whatsappService: WhatsAppService) {}

  @UseGuards(JwtAuthGuard)
  @Post('send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send WhatsApp message' })
  async sendMessage(@Body() messageData: Partial<WhatsAppMessage>, @Req() req: any) {
    return this.whatsappService.sendMessage(messageData, req.user);
  }

  @UseGuards(JwtAuthGuard)
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
    @Res() res: Response,
  ) {
    const result = await this.whatsappService.verifyWebhook(mode, token, challenge);
    return res.type('text/plain').status(200).send(result);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle WhatsApp webhook' })
  async handleWebhook(@Body() webhookData: any) {
    return this.whatsappService.handleWebhook(webhookData);
  }

  @UseGuards(JwtAuthGuard)
  @Get('messages/:leadId')
  @ApiOperation({ summary: 'Get WhatsApp messages for a lead' })
  async getMessages(@Param('leadId') leadId: string, @Req() req: any) {
    return this.whatsappService.getMessages(leadId, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('conversations')
  @ApiOperation({ summary: 'Get WhatsApp conversations' })
  async getConversations(@Req() req: any, @Query('status') status?: string) {
    return this.whatsappService.getConversations(req.user, status);
  }

  @UseGuards(JwtAuthGuard)
  @Get('analytics')
  @ApiOperation({ summary: 'Get WhatsApp analytics' })
  async getAnalytics(@Req() req: any, @Query('timeRange') timeRange?: string) {
    return this.whatsappService.getAnalytics(req.user.workspaceId, timeRange);
  }

  @UseGuards(JwtAuthGuard)
  @Post('sync-templates')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sync WhatsApp templates from Meta' })
  async syncTemplates(@Req() req: any) {
    return this.whatsappService.syncTemplatesFromMeta(req.user);
  }
}
