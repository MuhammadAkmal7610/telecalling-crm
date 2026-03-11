import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module';
import { EmailModule } from '../email/email.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { WorkflowBuilderService } from './workflow-builder.service';
import { WorkflowBuilderController } from './workflow-builder.controller';

@Module({
  imports: [SupabaseModule, EmailModule, NotificationsModule],
  controllers: [WorkflowBuilderController],
  providers: [WorkflowBuilderService],
  exports: [WorkflowBuilderService],
})
export class WorkflowBuilderModule {}
