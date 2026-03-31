import { Controller, Get, Post, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { ListsService } from './lists.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('lists')
@UseGuards(JwtAuthGuard)
export class ListsController {
    constructor(private readonly listsService: ListsService) { }

    @Get()
    async findAll(@Req() req: any) {
        return this.listsService.findAll(req.user);
    }

    @Post()
    async create(@Body() createDto: any, @Req() req: any) {
        return this.listsService.create(createDto, req.user);
    }

    @Delete(':id')
    async remove(@Param('id') id: string, @Req() req: any) {
        return this.listsService.remove(id, req.user.workspaceId);
    }

    @Post(':id/leads')
    async addLeads(@Param('id') id: string, @Body('leadIds') leadIds: string[], @Req() req: any) {
        return this.listsService.addLeadsToList(id, leadIds, req.user.workspaceId);
    }
}
