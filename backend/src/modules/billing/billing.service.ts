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

    async updateSubscription(organizationId: string, plan: string) {
        const supabase = this.supabaseService.getAdminClient();
        
        // Define limits per plan
        const planLimits: Record<string, any> = {
            free: { leads: 100, users: 2 },
            plus: { leads: 1000, users: 10 },
            pro: { leads: 5000, users: 50 },
            enterprise: { leads: 100000, users: 1000 },
        };

        const limits = planLimits[plan.toLowerCase()] || planLimits.free;

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
}
