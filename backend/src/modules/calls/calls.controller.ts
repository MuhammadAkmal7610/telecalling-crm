import {
    Controller, Get, Post, Patch, Delete, Body, Param,
    UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CallsService } from './calls.service';
import { CreateCallFeedbackStatusDto, UpdateCallFeedbackStatusDto } from './dto/call-feedback.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Call Feedback')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('calls/feedback-statuses')
export class CallsController {
    constructor(private readonly callsService: CallsService) { }

    @Get()
    @ApiOperation({ summary: 'Get all call feedback statuses' })
    getStatuses() {
        return this.callsService.getStatuses();
    }

    @Post()
    @ApiOperation({ summary: 'Add a call feedback status' })
    createStatus(@Body() dto: CreateCallFeedbackStatusDto) {
        return this.callsService.createStatus(dto);
    }

    @Patch('reorder')
    @ApiOperation({ summary: 'Reorder call feedback statuses' })
    reorder(@Body() body: { statusIds: string[] }) {
        return this.callsService.reorderStatuses(body.statusIds);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a call feedback status' })
    updateStatus(@Param('id') id: string, @Body() dto: UpdateCallFeedbackStatusDto) {
        return this.callsService.updateStatus(id, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Delete a call feedback status' })
    removeStatus(@Param('id') id: string) {
        return this.callsService.removeStatus(id);
    }
}
