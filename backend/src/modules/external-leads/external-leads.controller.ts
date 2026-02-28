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
    async indiamart(@Body() data: any, @Query('orgId') orgId: string) {
        if (!orgId) throw new BadRequestException('Organization ID (orgId) is required in query params');
        return this.externalLeadsService.handleIndiaMart(data, orgId);
    }

    @Post('justdial')
    @ApiOperation({ summary: 'Justdial Webhook' })
    @ApiQuery({ name: 'orgId', required: true })
    async justdial(@Body() data: any, @Query('orgId') orgId: string) {
        if (!orgId) throw new BadRequestException('Organization ID (orgId) is required in query params');
        return this.externalLeadsService.handleJustdial(data, orgId);
    }

    @Post('webhook/:orgId/:source')
    @ApiOperation({ summary: 'Generic Webhook' })
    @ApiParam({ name: 'orgId', required: true })
    @ApiParam({ name: 'source', required: true })
    async genericWebhook(
        @Param('orgId') orgId: string,
        @Param('source') source: string,
        @Body() data: any
    ) {
        return this.externalLeadsService.handleGenericWebhook(source, data, orgId);
    }
}
