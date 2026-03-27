import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseModule } from './modules/supabase/supabase.module';
import { AuthModule } from './modules/auth/auth.module';
import { LeadsModule } from './modules/leads/leads.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { ActivitiesModule } from './modules/activities/activities.module';
import { CampaignsModule } from './modules/campaigns/campaigns.module';
import { PipelineModule } from './modules/pipeline/pipeline.module';
import { ReportsModule } from './modules/reports/reports.module';
import { CallsModule } from './modules/calls/calls.module';
import { UsersModule } from './modules/users/users.module';
import { TemplatesModule } from './modules/templates/templates.module';
import { SchedulesModule } from './modules/schedules/schedules.module';
import { WorkspacesModule } from './modules/workspaces/workspaces.module';
import { BillingModule } from './modules/billing/billing.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { SalesformsModule } from './modules/salesforms/salesforms.module';
import { WorkflowsModule } from './modules/workflows/workflows.module';
import { ListsModule } from './modules/lists/lists.module';
import { LeadFieldsModule } from './modules/lead-fields/lead-fields.module';
import { LeadStagesModule } from './modules/lead-stages/lead-stages.module';
import { BlocklistModule } from './modules/blocklist/blocklist.module';
import { ExternalLeadsModule } from './modules/external-leads/external-leads.module';
import { SearchModule } from './modules/search/search.module';
import { ScriptsModule } from './modules/scripts/scripts.module';
import { PublicModule } from './modules/public/public.module';
import { AdminModule } from './modules/admin/admin.module';
import { TelephonyModule } from './modules/telephony/telephony.module';
import { QueuesModule } from './modules/queues/queues.module';
import { WhatsAppModule } from './modules/whatsapp/whatsapp.module';
import { EmailModule } from './modules/email/email.module';
import { AppConfigModule } from './modules/app-config/app-config.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';

@Module({
  imports: [
    // ---added by akmal--Global config module - reads .env automatically
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    SupabaseModule,
    AuthModule,
    LeadsModule,
    TasksModule,
    ActivitiesModule,
    CampaignsModule,
    PipelineModule,
    ReportsModule,
    CallsModule,
    UsersModule,
    TemplatesModule,
    SchedulesModule,
    WorkspacesModule,
    BillingModule,
    NotificationsModule,
    IntegrationsModule,
    SalesformsModule,
    WorkflowsModule,
    ListsModule,
    LeadFieldsModule,
    LeadStagesModule,
    BlocklistModule,
    ExternalLeadsModule,
    SearchModule,
    ScriptsModule,
    PublicModule,
    AdminModule,
    TelephonyModule,
    QueuesModule,
    WhatsAppModule,
    EmailModule,
    AppConfigModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
