import { Module, forwardRef } from '@nestjs/common';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [
        SupabaseModule,
        forwardRef(() => NotificationsModule),
    ],
    controllers: [DevicesController],
    providers: [DevicesService],
    exports: [DevicesService],
})
export class DevicesModule { }