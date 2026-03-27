import { Module } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CampaignsController } from './campaigns.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { WhatsAppModule } from '../whatsapp/whatsapp.module';

@Module({
  imports: [SupabaseModule, WhatsAppModule],
  controllers: [CampaignsController],
  providers: [CampaignsService],
  exports: [CampaignsService],
})
export class CampaignsModule { }
