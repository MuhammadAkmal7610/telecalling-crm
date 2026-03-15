import { Module } from '@nestjs/common';
import { WorkflowsService } from './workflows.service';
import { WorkflowsController } from './workflows.controller';
import { WorkflowsWebhookController } from './workflows-webhook.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { WorkflowsEngineService } from './workflows-engine.service';

@Module({
  imports: [SupabaseModule],
  controllers: [WorkflowsController, WorkflowsWebhookController],
  providers: [WorkflowsService, WorkflowsEngineService],
  exports: [WorkflowsService, WorkflowsEngineService],
})
export class WorkflowsModule { }
