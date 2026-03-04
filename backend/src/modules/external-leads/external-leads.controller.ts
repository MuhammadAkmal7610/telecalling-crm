import { Controller, Post, Body, Param, Query, BadRequestException } from '@nestjs/common';
import { ExternalLeadsService } from './external-leads.service';
import { ApiOperation, ApiTags, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('External Leads')
@Controller('external-leads')
export class ExternalLeadsController {
    constructor(private readonly externalLeadsService: ExternalLeadsService) { }

    @Post('indiamart')
    @ApiOperation({ summary: 'IndiaMART Webhook' })
    @ApiQuery({ name: 'orgId', required: true })
    @ApiQuery({ name: 'token', required: true })
    async indiamart(
        @Body() data: any,
        @Query('orgId') orgId: string,
        @Query('token') token: string
    ) {
        if (!orgId) throw new BadRequestException('orgId is required');
        if (!token) throw new BadRequestException('token is required');
        await this.externalLeadsService.validateToken(orgId, token);
        return this.externalLeadsService.handleIndiaMart(data, orgId);
    }

    @Post('justdial')
    @ApiOperation({ summary: 'Justdial Webhook' })
    @ApiQuery({ name: 'orgId', required: true })
    @ApiQuery({ name: 'token', required: true })
    async justdial(
        @Body() data: any,
        @Query('orgId') orgId: string,
        @Query('token') token: string
    ) {
        if (!orgId) throw new BadRequestException('orgId is required');
        if (!token) throw new BadRequestException('token is required');
        await this.externalLeadsService.validateToken(orgId, token);
        return this.externalLeadsService.handleJustdial(data, orgId);
    }

    @Post('webhook/:orgId/:source')
    @ApiOperation({ summary: 'Generic Webhook' })
    @ApiParam({ name: 'orgId', required: true })
    @ApiParam({ name: 'source', required: true })
    @ApiQuery({ name: 'token', required: true })
    async genericWebhook(
        @Param('orgId') orgId: string,
        @Param('source') source: string,
        @Query('token') token: string,
        @Body() data: any
    ) {
        if (!token) throw new BadRequestException('token is required');
        await this.externalLeadsService.validateToken(orgId, token);
        return this.externalLeadsService.handleGenericWebhook(source, data, orgId);
    }
}
