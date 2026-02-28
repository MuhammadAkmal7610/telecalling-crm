import { Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { IntegrationsService } from './integrations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('integrations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('integrations')
export class IntegrationsController {
    constructor(private readonly integrationsService: IntegrationsService) { }

    @ApiOperation({ summary: 'Get all integrations' })
    @Get()
    async findAll(@Request() req: any) {
        const integrations = await this.integrationsService.findAll(req.user.organizationId);
        if (integrations.length === 0) {
            return { data: await this.integrationsService.seedDefaults(req.user.organizationId) };
        }
        return { data: integrations };
    }

    @ApiOperation({ summary: 'Seed default integrations' })
    @Post('seed')
    seed(@Request() req: any) {
        return this.integrationsService.seedDefaults(req.user.organizationId);
    }
}
