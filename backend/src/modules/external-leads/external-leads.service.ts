import { Injectable, Logger, ForbiddenException, NotFoundException } from '@nestjs/common';
import { LeadsService } from '../leads/leads.service';
import { CreateLeadDto, LeadSource } from '../leads/dto/lead.dto';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class ExternalLeadsService {
    private readonly logger = new Logger(ExternalLeadsService.name);

    constructor(
        private readonly leadsService: LeadsService,
        private readonly supabaseService: SupabaseService
    ) { }

    async validateToken(organizationId: string, token: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from('organizations')
            .select('webhook_token')
            .eq('id', organizationId)
            .single();

        if (error || !data) throw new NotFoundException('Organization not found');
        if (data.webhook_token !== token) throw new ForbiddenException('Invalid webhook token');

        return true;
    }

    private async getDefaultWorkspace(organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from('workspaces')
            .select('id')
            .eq('organization_id', organizationId)
            .eq('is_default', true)
            .single();

        if (error || !data) {
            // Fallback to first workspace if no default set
            const { data: first } = await supabase
                .from('workspaces')
                .select('id')
                .eq('organization_id', organizationId)
                .limit(1)
                .single();
            return first?.id;
        }
        return data.id;
    }

    async handleIndiaMart(data: any, organizationId: string) {
        this.logger.log(`Handling IndiaMART lead for org: ${organizationId}`);
        // IndiaMART format mapping
        const leadDto: CreateLeadDto = {
            name: data.SENDER_NAME || 'IndiaMART Lead',
            phone: data.SENDER_MOBILE || data.SENDER_PHONE,
            email: data.SENDER_EMAIL,
            source: LeadSource.INDIAMART,
            customFields: {
                query_id: data.QUERY_ID,
                subject: data.SUBJECT,
                message: data.MESSAGE,
                product_name: data.PRODUCT_NAME,
                city: data.SENDER_CITY
            }
        };

        return this.processExternalLead(leadDto, organizationId);
    }

    async handleJustdial(data: any, organizationId: string) {
        this.logger.log(`Handling Justdial lead for org: ${organizationId}`);
        // Justdial format mapping
        const leadDto: CreateLeadDto = {
            name: data.name || 'Justdial Lead',
            phone: data.mobile || data.phone,
            email: data.email,
            source: LeadSource.JUSTDIAL,
            customFields: {
                category: data.category,
                area: data.area,
                city: data.city
            }
        };

        return this.processExternalLead(leadDto, organizationId);
    }

    async handleGenericWebhook(source: string, data: any, organizationId: string) {
        this.logger.log(`Handling Generic Webhook (${source}) for org: ${organizationId}`);
        const leadDto: CreateLeadDto = {
            name: data.name || data.full_name || 'Generic Lead',
            phone: data.phone || data.mobile || data.telephone,
            email: data.email,
            source: source as LeadSource,
            customFields: data
        };

        return this.processExternalLead(leadDto, organizationId);
    }

    private async processExternalLead(dto: CreateLeadDto, organizationId: string) {
        const workspaceId = await this.getDefaultWorkspace(organizationId);

        const systemUser = {
            id: '00000000-0000-0000-0000-000000000000',
            organizationId,
            workspaceId
        };

        try {
            return await this.leadsService.create(dto, systemUser);
        } catch (error) {
            this.logger.error(`Error processing external lead for org ${organizationId}: ${error.message}`);
            throw error;
        }
    }
}
