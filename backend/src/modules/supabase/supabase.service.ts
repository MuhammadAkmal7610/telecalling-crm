import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
    private readonly logger = new Logger(SupabaseService.name);
    private supabase: SupabaseClient;
    private adminClient: SupabaseClient;

    constructor(private configService: ConfigService) { }

    /** Anon client — uses SUPABASE_ANON_KEY (respects RLS) */
    getClient(): SupabaseClient {
        if (this.supabase) return this.supabase;

        const url = this.configService.get<string>('SUPABASE_URL');
        const key = this.configService.get<string>('SUPABASE_ANON_KEY');

        if (!url || !key) {
            this.logger.error('Supabase URL or Anon Key is missing!');
            throw new Error('Supabase configuration is incomplete');
        }

        this.supabase = createClient(url, key);
        return this.supabase;
    }

    /**
     * Admin client — uses SUPABASE_SERVICE_ROLE_KEY (bypasses RLS).
     * Use only in server-side service layer, never expose to frontend.
     */
    getAdminClient(): SupabaseClient {
        if (this.adminClient) return this.adminClient;

        const url = this.configService.get<string>('SUPABASE_URL');
        const key = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

        if (!url || !key) {
            this.logger.warn('Service role key not found, falling back to anon client');
            return this.getClient();
        }

        this.adminClient = createClient(url, key, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });
        return this.adminClient;
    }
}
