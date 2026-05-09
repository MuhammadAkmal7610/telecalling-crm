import { Module } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { InvitationsController } from './invitations.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { BillingModule } from '../billing/billing.module';
import { EmailModule } from '../email/email.module';

@Module({
    imports: [SupabaseModule, EmailModule, BillingModule],
    providers: [InvitationsService],
    controllers: [InvitationsController],
    exports: [InvitationsService],
})
export class InvitationsModule { }
