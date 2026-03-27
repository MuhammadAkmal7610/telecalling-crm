import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AppConfigService } from './app-config.service';

@ApiTags('Config')
@Controller('app-config')
export class AppConfigController {
    constructor(private readonly appConfigService: AppConfigService) { }

    @Get('home')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get home page configuration' })
    getHomeConfig() {
        return this.appConfigService.getHomeConfig();
    }
}
