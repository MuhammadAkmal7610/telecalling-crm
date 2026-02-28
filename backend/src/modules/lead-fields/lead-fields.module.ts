import { Module } from '@nestjs/common';
import { LeadFieldsService } from './lead-fields.service';
import { LeadFieldsController } from './lead-fields.controller';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [LeadFieldsController],
  providers: [LeadFieldsService],
  exports: [LeadFieldsService],
})
export class LeadFieldsModule { }
