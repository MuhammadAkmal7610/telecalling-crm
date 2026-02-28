import { Controller, Get, Post, Body, Param, BadRequestException, NotFoundException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SupabaseService } from '../supabase/supabase.service';

@ApiTags('Public')
@Controller('public')
export class PublicController {
    constructor(private readonly supabaseService: SupabaseService) { }

    @Get('organization/:name')
    @ApiOperation({ summary: 'Get organization ID by name (Public)' })
    async getOrg(@Param('name') name: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from('organizations')
            .select('id, name')
            .ilike('name', name)
            .single();

        if (error || !data) throw new NotFoundException('Organization not found');
        return data;
    }

    @Get('fields/:orgId')
    @ApiOperation({ summary: 'Get lead field definitions for an organization (Public)' })
    async getFields(@Param('orgId') orgId: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from('lead_field_definitions')
            .select('*')
            .eq('organization_id', orgId)
            .order('position', { ascending: true });

        if (error) throw new BadRequestException(error.message);
        return data;
    }

    @Post('lead')
    @ApiOperation({ summary: 'Submit a new lead from a public form' })
    async submitLead(@Body() body: any) {
        const { organizationId, name, phone, email, altPhone, source, customFields } = body;

        if (!organizationId || !name || !phone) {
            throw new BadRequestException('Missing required fields: organizationId, name, phone');
        }

        const supabase = this.supabaseService.getAdminClient();

        // 1. Check for duplicates (Phone)
        const { data: existingLeads } = await supabase
            .from('leads')
            .select('id')
            .eq('organization_id', organizationId)
            .eq('phone', phone)
            .limit(1);

        if (existingLeads && existingLeads.length > 0) {
            // Optional: Tag as duplicate or just accept
            // For public forms, we often just create another record or update existing
        }

        // 2. Insert lead
        const { data: newLead, error } = await supabase
            .from('leads')
            .insert({
                organization_id: organizationId,
                name,
                phone,
                email,
                alt_phone: altPhone,
                source: source || 'Public Form',
                custom_fields: customFields || {},
                status: 'fresh'
            })
            .select()
            .single();

        if (error) throw new BadRequestException(error.message);

        // 3. Create activity
        await supabase.from('activities').insert({
            organization_id: organizationId,
            lead_id: newLead.id,
            type: 'lead_captured',
            details: { source: source || 'Public Form' }
        });

        return { success: true, leadId: newLead.id };
    }
}
