import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { EmailController } from './email.controller';
import { EmailTrackingController } from './email-tracking.controller';
import { EmailService } from './email.service';

@Module({
  imports: [SupabaseModule, NotificationsModule],
  controllers: [EmailController, EmailTrackingController],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
