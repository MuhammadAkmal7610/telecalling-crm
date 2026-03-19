import { Module } from '@nestjs/common';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { StripeService } from './stripe.service';

@Module({
  imports: [SupabaseModule],
  controllers: [BillingController],
  providers: [BillingService, StripeService],
  exports: [BillingService, StripeService],
})
export class BillingModule { }
