import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class QueueProcessorService {
    private readonly logger = new Logger(QueueProcessorService.name);
    private isProcessing = false;

    constructor(private readonly supabaseService: SupabaseService) {}

    @Cron(CronExpression.EVERY_MINUTE)
    async handleCron() {
        if (this.isProcessing) return;
        this.isProcessing = true;
        this.logger.log('Starting queue processor...');

        try {
            await Promise.all([
                this.processWebhookQueue(),
                this.processEmailQueue(),
                this.processSMSQueue()
            ]);
        } catch (error) {
            this.logger.error(`Error in queue processor: ${error.message}`);
        } finally {
            this.isProcessing = false;
        }
    }

    private async processWebhookQueue() {
        const supabase = this.supabaseService.getAdminClient();
        
        // Find pending webhooks
        const { data: webhooks, error } = await supabase
            .from('webhook_queue')
            .select('*')
            .eq('status', 'pending')
            .limit(10);

        if (error || !webhooks || webhooks.length === 0) return;

        this.logger.log(`Processing ${webhooks.length} webhooks...`);

        for (const webhook of webhooks) {
            try {
                const response = await fetch(webhook.url, {
                    method: webhook.method || 'POST',
                    headers: typeof webhook.headers === 'string' ? JSON.parse(webhook.headers) : (webhook.headers || {}),
                    body: webhook.method !== 'GET' ? webhook.body : undefined
                });

                const responseBody = await response.text();
                
                await supabase
                    .from('webhook_queue')
                    .update({
                        status: response.ok ? 'sent' : 'failed',
                        sent_at: new Date().toISOString(),
                        response_code: response.status,
                        response_body: responseBody.substring(0, 1000),
                        attempts: (webhook.attempts || 0) + 1
                    })
                    .eq('id', webhook.id);

            } catch (err) {
                this.logger.error(`Failed to send webhook ${webhook.id}: ${err.message}`);
                await supabase
                    .from('webhook_queue')
                    .update({
                        status: 'failed',
                        error_message: err.message,
                        attempts: (webhook.attempts || 0) + 1
                    })
                    .eq('id', webhook.id);
            }
        }
    }

    private async processEmailQueue() {
        // Placeholder for email processing
        // Will need SMTP or OAuth integration
        const supabase = this.supabaseService.getAdminClient();
        const { data: emails } = await supabase
            .from('email_queue')
            .select('*')
            .eq('status', 'pending')
            .limit(5);

        if (!emails || emails.length === 0) return;
        
        this.logger.log(`Skipping ${emails.length} emails (processor not fully implemented)`);
    }

    private async processSMSQueue() {
        // Placeholder for SMS processing
        const supabase = this.supabaseService.getAdminClient();
        const { data: sms } = await supabase
            .from('sms_queue')
            .select('*')
            .eq('status', 'pending')
            .limit(5);

        if (!sms || sms.length === 0) return;
        
        this.logger.log(`Skipping ${sms.length} SMS (processor not fully implemented)`);
    }
}
