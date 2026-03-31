import { Module } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { InvitationsController } from './invitations.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { EmailModule } from '../email/email.module';

@Module({
    imports: [SupabaseModule, EmailModule],
    providers: [InvitationsService],
    controllers: [InvitationsController],
    exports: [InvitationsService],
})
export class InvitationsModule { }
