import { Injectable, Logger } from '@nestjs/common';
import { LeadsService } from '../leads/leads.service';
import { CreateLeadDto, LeadSource } from '../leads/dto/lead.dto';

@Injectable()
export class ExternalLeadsService {
    private readonly logger = new Logger(ExternalLeadsService.name);

    constructor(private readonly leadsService: LeadsService) { }

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
        // Simple check for duplicates by phone if lead service doesn't handle it
        // We'll use a system user as the "creator" for external leads
        const systemUser = {
            id: '00000000-0000-0000-0000-000000000000', // Reserved system ID or just a placeholder handled by service
            organizationId
        };

        try {
            return await this.leadsService.create(dto, systemUser);
        } catch (error) {
            this.logger.error(`Error processing external lead: ${error.message}`);
            throw error;
        }
    }
}
