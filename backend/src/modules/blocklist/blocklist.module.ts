import { Module } from '@nestjs/common';
import { BlocklistService } from './blocklist.service';
import { BlocklistController } from './blocklist.controller';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [BlocklistController],
  providers: [BlocklistService],
  exports: [BlocklistService],
})
export class BlocklistModule { }
