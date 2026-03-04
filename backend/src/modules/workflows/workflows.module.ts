import { Module } from '@nestjs/common';
import { WorkflowsService } from './workflows.service';
import { WorkflowsController } from './workflows.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { WorkflowsEngineService } from './workflows-engine.service';

@Module({
  imports: [SupabaseModule],
  controllers: [WorkflowsController],
  providers: [WorkflowsService, WorkflowsEngineService],
  exports: [WorkflowsService, WorkflowsEngineService],
})
export class WorkflowsModule { }
