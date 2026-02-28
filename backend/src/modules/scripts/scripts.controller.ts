import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ScriptsService } from './scripts.service';
import { CreateScriptDto, UpdateScriptDto } from './dto/script.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('scripts')
@UseGuards(JwtAuthGuard)
export class ScriptsController {
    constructor(private readonly scriptsService: ScriptsService) { }

    @Post()
    create(@Body() createScriptDto: CreateScriptDto, @Request() req: any) {
        return this.scriptsService.create(createScriptDto, req.user.organizationId);
    }

    @Get()
    findAll(@Request() req: any) {
        return this.scriptsService.findAll(req.user.organizationId);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Request() req: any) {
        return this.scriptsService.findOne(id, req.user.organizationId);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateScriptDto: UpdateScriptDto, @Request() req: any) {
        return this.scriptsService.update(id, updateScriptDto, req.user.organizationId);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Request() req: any) {
        return this.scriptsService.remove(id, req.user.organizationId);
    }
}
