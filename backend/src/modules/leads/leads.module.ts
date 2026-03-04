import { Module } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { WorkflowsModule } from '../workflows/workflows.module';
import { ActivitiesModule } from '../activities/activities.module';

@Module({
  imports: [SupabaseModule, WorkflowsModule, ActivitiesModule],
  controllers: [LeadsController],
  providers: [LeadsService],
  exports: [LeadsService],
})
export class LeadsModule { }
