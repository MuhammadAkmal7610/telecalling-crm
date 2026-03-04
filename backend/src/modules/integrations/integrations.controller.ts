import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { IntegrationsService } from './integrations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('integrations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('integrations')
@Roles('admin', 'root')
export class IntegrationsController {
    constructor(private readonly integrationsService: IntegrationsService) { }

    @ApiOperation({ summary: 'Get all integrations' })
    @Get()
    async findAll(@CurrentUser() user: any) {
        const result = await this.integrationsService.findAll(user.organizationId);
        if (result.integrations.length === 0) {
            return { data: await this.integrationsService.seedDefaults(user.organizationId) };
        }
        return { data: result };
    }

    @ApiOperation({ summary: 'Seed default integrations' })
    @Post('seed')
    seed(@CurrentUser() user: any) {
        return this.integrationsService.seedDefaults(user.organizationId);
    }
}
