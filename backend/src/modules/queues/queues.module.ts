import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { QueueProcessorService } from './queue-processor.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    SupabaseModule
  ],
  providers: [QueueProcessorService],
  exports: [QueueProcessorService]
})
export class QueuesModule { }
