import { Module } from '@nestjs/common';
import { TelephonyController } from './telephony.controller';
import { TelephonyService } from './telephony.service';
import { DialerGateway } from './dialer.gateway';
import { SupabaseModule } from '../supabase/supabase.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ActivitiesModule } from '../activities/activities.module';
import { LeadsModule } from '../leads/leads.module';

@Module({
  imports: [
    SupabaseModule,
    NotificationsModule,
    ActivitiesModule,
    LeadsModule,
  ],
  controllers: [TelephonyController],
  providers: [TelephonyService, DialerGateway],
  exports: [TelephonyService],
})
export class TelephonyModule { }
