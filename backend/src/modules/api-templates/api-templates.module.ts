import { Module } from '@nestjs/common';
import { ApiTemplatesService } from './api-templates.service';
import { ApiTemplatesController } from './api-templates.controller';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
    imports: [SupabaseModule],
    providers: [ApiTemplatesService],
    controllers: [ApiTemplatesController],
    exports: [ApiTemplatesService],
})
export class ApiTemplatesModule { }
