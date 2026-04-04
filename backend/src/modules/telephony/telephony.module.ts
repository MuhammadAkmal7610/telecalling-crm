import { Module } from '@nestjs/common';
import { TelephonyController } from './telephony.controller';
import { TelephonyService } from './telephony.service';
import { DialerGateway } from './dialer.gateway';
import { TelephonyGateway } from './telephony.gateway';
import { SupabaseModule } from '../supabase/supabase.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ActivitiesModule } from '../activities/activities.module';
import { LeadsModule } from '../leads/leads.module';
import { DevicesModule } from '../devices/devices.module';

@Module({
  imports: [
    SupabaseModule,
    NotificationsModule,
    ActivitiesModule,
    LeadsModule,
    DevicesModule,
  ],
  controllers: [TelephonyController],
  providers: [TelephonyService, DialerGateway, TelephonyGateway],
  exports: [TelephonyService, TelephonyGateway],
})
export class TelephonyModule { }
