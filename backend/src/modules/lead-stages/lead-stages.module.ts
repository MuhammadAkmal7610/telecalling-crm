import { Module } from '@nestjs/common';
import { LeadStagesService } from './lead-stages.service';
import { LeadStagesController } from './lead-stages.controller';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [LeadStagesController],
  providers: [LeadStagesService],
  exports: [LeadStagesService],
})
export class LeadStagesModule { }
