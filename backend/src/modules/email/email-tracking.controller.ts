import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import type { Response } from 'express';
import { SupabaseService } from '../supabase/supabase.service';

@ApiTags('Email Tracking')
@Controller('email-tracking')
export class EmailTrackingController {
    constructor(private readonly supabaseService: SupabaseService) {}

    @Get('open/:logId')
    @ApiOperation({ summary: 'Track email open' })
    async trackOpen(@Param('logId') logId: string, @Res() res: Response) {
        const supabase = this.supabaseService.getAdminClient();
        
        try {
            await supabase
                .from('email_logs')
                .update({ 
                    status: 'opened', 
                    opened_at: new Date().toISOString() 
                })
                .eq('id', logId);
        } catch (error) {
            console.error('Error tracking email open:', error);
        }

        // Return a 1x1 transparent GIF
        const buffer = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
        res.set('Content-Type', 'image/gif');
        res.send(buffer);
    }

    @Get('click/:logId')
    @ApiOperation({ summary: 'Track email click' })
    async trackClick(@Param('logId') logId: string, @Query('url') url: string, @Res() res: Response) {
        const supabase = this.supabaseService.getAdminClient();
        
        try {
            await supabase
                .from('email_logs')
                .update({ 
                    status: 'clicked', 
                    clicked_at: new Date().toISOString() 
                })
                .eq('id', logId);
        } catch (error) {
            console.error('Error tracking email click:', error);
        }

        // Redirect to the actual URL
        res.redirect(url || '/');
    }
}
