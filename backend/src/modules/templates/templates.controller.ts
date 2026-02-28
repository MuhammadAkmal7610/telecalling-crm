import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Templates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('templates')
export class TemplatesController {
    constructor(private readonly templatesService: TemplatesService) { }

    @Get()
    findAll(@CurrentUser() user: any) {
        return this.templatesService.findAll(user.organizationId);
    }

    @Post()
    create(@Body() dto: any, @CurrentUser() user: any) {
        return this.templatesService.create(dto, user.organizationId);
    }
}
