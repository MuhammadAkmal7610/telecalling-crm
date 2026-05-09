import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class BillingService {
    private readonly TABLE = 'billing_subscriptions'; // ---added by akmal--Assuming this table exists in schema

    constructor(private readonly supabaseService: SupabaseService) { }

    async getSubscription(organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from(this.TABLE)
            .select('*')
            .eq('organization_id', organizationId)
            .single();

        if (error && error.code !== 'PGRST116') throw new BadRequestException(error.message);

        // ---added by akmal--Return default free plan if not found
        return data || {
            organization_id: organizationId,
            plan: 'free',
            status: 'active',
            limits: { leads: 100, users: 2 }
        };
    }

    async getSeatUsage(organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();
        
        // Count active users in organization
        const { count: usersCount, error: usersError } = await supabase
            .from('users')
            .select('id', { count: 'exact', head: true })
            .eq('organization_id', organizationId);

        if (usersError) throw new BadRequestException(usersError.message);

        // Count pending invitations
        const { count: invitesCount, error: invitesError } = await supabase
            .from('invitations')
            .select('id', { count: 'exact', head: true })
            .eq('organization_id', organizationId)
            .eq('status', 'pending');

        if (invitesError) throw new BadRequestException(invitesError.message);

        const sub = await this.getSubscription(organizationId);
        const totalLicenses = sub.limits?.users || 0;

        return {
            usedSeats: (usersCount || 0) + (invitesCount || 0),
            totalLicenses,
            availableSeats: Math.max(0, totalLicenses - ((usersCount || 0) + (invitesCount || 0)))
        };
    }

    async updateSubscription(organizationId: string, plan: string, customUserLimit?: number) {
        const supabase = this.supabaseService.getAdminClient();
        
        // Define base limits per plan
        const planLimits: Record<string, any> = {
            free: { leads: 100, users: 2 },
            plus: { leads: 1000, users: 10 },
            pro: { leads: 5000, users: 50 },
            enterprise: { leads: 100000, users: 1000 },
        };

        const limits = planLimits[plan.toLowerCase()] || planLimits.free;
        
        // Override user limit if specifically provided (seat-based billing)
        if (customUserLimit !== undefined) {
            limits.users = customUserLimit;
        }

        const { data, error } = await supabase
            .from(this.TABLE)
            .upsert({
                organization_id: organizationId,
                plan,
                limits,
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw new BadRequestException(error.message);
        return data;
    }

    async getTransactions(organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('organization_id', organizationId)
            .order('created_at', { ascending: false });

        if (error) throw new BadRequestException(error.message);
        return data;
    }

    async getBillingInfo(organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from('organization_billing_info')
            .select('*')
            .eq('organization_id', organizationId)
            .single();

        if (error && error.code !== 'PGRST116') throw new BadRequestException(error.message);
        
        return data || {
            organization_id: organizationId,
            company_name: '',
            email: '',
            phone: '',
            address_line1: '',
            address_line2: '',
            city: '',
            state: '',
            country: '',
            pincode: '',
            tax_id: ''
        };
    }

    async updateBillingInfo(organizationId: string, billingInfo: any) {
        const supabase = this.supabaseService.getAdminClient();
        
        const { id, created_at, updated_at, ...updateData } = billingInfo;

        const { data, error } = await supabase
            .from('organization_billing_info')
            .upsert({
                ...updateData,
                organization_id: organizationId,
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw new BadRequestException(error.message);
        return data;
    }

    async handleStripeWebhook(payload: any) {
        const event = payload; // In production, verify signature with stripe.webhooks.constructEvent

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const organizationId = session.metadata?.organizationId;
            const plan = session.metadata?.plan;
            const quantity = parseInt(session.metadata?.quantity || '1', 10);

            if (organizationId && plan) {
                await this.updateSubscription(organizationId, plan, quantity);
            }
        }
        
        return { received: true };
    }
}
