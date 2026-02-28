import { Module } from '@nestjs/common';
import { PublicController } from './public.controller';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
    imports: [SupabaseModule],
    controllers: [PublicController],
})
export class PublicModule { }
