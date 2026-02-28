import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/workspace.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspacesController {
    constructor(private readonly workspacesService: WorkspacesService) { }

    @Post()
    create(@Body() dto: CreateWorkspaceDto, @CurrentUser() user: any) {
        return this.workspacesService.createWorkspace(dto, user.organizationId);
    }

    @Get()
    findAll(@CurrentUser() user: any) {
        return this.workspacesService.findAllInOrg(user.organizationId);
    }
}
