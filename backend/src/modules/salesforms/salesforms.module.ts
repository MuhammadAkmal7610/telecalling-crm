import { Module } from '@nestjs/common';
import { SalesformsService } from './salesforms.service';
import { SalesformsController } from './salesforms.controller';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [SalesformsController],
  providers: [SalesformsService],
  exports: [SalesformsService],
})
export class SalesformsModule { }
