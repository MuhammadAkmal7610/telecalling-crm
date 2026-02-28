import { Module } from '@nestjs/common';
import { ExternalLeadsService } from './external-leads.service';
import { ExternalLeadsController } from './external-leads.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { LeadsModule } from '../leads/leads.module';

@Module({
  imports: [SupabaseModule, LeadsModule],
  controllers: [ExternalLeadsController],
  providers: [ExternalLeadsService],
  exports: [ExternalLeadsService],
})
export class ExternalLeadsModule { }
