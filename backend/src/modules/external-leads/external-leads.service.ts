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

    async handleFacebook(data: any, organizationId: string) {
        this.logger.log(`Handling Facebook Lead Ads for org: ${organizationId}`);
        
        // Facebook Lead Ads usually sends field_data array
        const fieldData = data.field_data || [];
        const mappedData: any = {};
        fieldData.forEach((field: any) => {
            mappedData[field.name] = field.values?.[0];
        });

        const leadDto: CreateLeadDto = {
            name: mappedData.full_name || mappedData.first_name || 'Facebook Lead',
            phone: mappedData.phone_number || mappedData.phone,
            email: mappedData.email,
            source: LeadSource.FACEBOOK,
            customFields: {
                ...mappedData,
                fb_lead_id: data.id,
                fb_form_id: data.form_id
            }
        };

        return this.processExternalLead(leadDto, organizationId);
    }

    async handleGoogleAds(data: any, organizationId: string) {
        this.logger.log(`Handling Google Ads lead for org: ${organizationId}`);
        
        // Google Ads Webhook format
        // https://developers.google.com/google-ads/api/docs/conversions/upload-lead-conversions
        const userColumnData = data.user_column_data || [];
        const mappedData: any = {};
        
        userColumnData.forEach((field: any) => {
            const columnId = field.column_id;
            const stringValue = field.string_value;
            
            if (columnId === 'FULL_NAME') mappedData.name = stringValue;
            else if (columnId === 'PHONE_NUMBER') mappedData.phone = stringValue;
            else if (columnId === 'EMAIL') mappedData.email = stringValue;
            else mappedData[columnId] = stringValue;
        });

        const leadDto: CreateLeadDto = {
            name: mappedData.name || 'Google Ads Lead',
            phone: mappedData.phone || data.phone_number,
            email: mappedData.email || data.email,
            source: LeadSource.GOOGLE_ADS,
            customFields: {
                ...mappedData,
                google_key: data.google_key,
                campaign_id: data.campaign_id,
                adgroup_id: data.adgroup_id
            }
        };

        return this.processExternalLead(leadDto, organizationId);
    }

    async handleGenericWebhook(source: string, data: any, organizationId: string) {
        this.logger.log(`Handling Generic Webhook (${source}) for org: ${organizationId}`);
        
        // Enhanced generic mapping
        const name = data.name || data.full_name || data.fullName || data.customer_name || 'Generic Lead';
        const phone = data.phone || data.mobile || data.telephone || data.phone_number || data.contact;
        const email = data.email || data.email_address || data.mail;
        const city = data.city || data.location || data.address;

        const leadDto: CreateLeadDto = {
            name: String(name),
            phone: String(phone),
            email: email ? String(email) : undefined,
            city: city ? String(city) : undefined,
            source: source.toUpperCase() as LeadSource,
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
