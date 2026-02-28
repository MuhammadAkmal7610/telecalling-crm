import { Module } from '@nestjs/common';
import { ScriptsService } from './scripts.service';
import { ScriptsController } from './scripts.controller';
import { SupabaseService } from '../supabase/supabase.service';
@Module({
  providers: [ScriptsService, SupabaseService],
  controllers: [ScriptsController]
})
export class ScriptsModule { }
