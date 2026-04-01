import { IsString, IsOptional, IsEnum, IsArray, IsObject, IsDateString, IsInt, Min, Max, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWhatsAppCampaignDto {
  @ApiProperty({ description: 'Campaign name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Campaign description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ['bulk', 'drip', 'triggered'], description: 'Campaign type' })
  @IsEnum(['bulk', 'drip', 'triggered'])
  campaign_type: 'bulk' | 'drip' | 'triggered';

  @ApiPropertyOptional({ description: 'Template name for the campaign' })
  @IsOptional()
  @IsString()
  template_name?: string;

  @ApiPropertyOptional({ description: 'Message content for bulk campaigns' })
  @IsOptional()
  @IsString()
  message_content?: string;

  @ApiPropertyOptional({ description: 'Variable mapping for personalization' })
  @IsOptional()
  @IsObject()
  variables_mapping?: Record<string, string>;

  @ApiPropertyOptional({ description: 'Target audience filters' })
  @IsOptional()
  @IsObject()
  target_audience?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Lead filters' })
  @IsOptional()
  @IsObject()
  lead_filters?: Record<string, any>;

  @ApiProperty({ enum: ['immediate', 'scheduled', 'recurring'], description: 'Schedule type' })
  @IsEnum(['immediate', 'scheduled', 'recurring'])
  schedule_type: 'immediate' | 'scheduled' | 'recurring';

  @ApiPropertyOptional({ description: 'Scheduled date and time' })
  @IsOptional()
  @IsDateString()
  scheduled_at?: string;

  @ApiPropertyOptional({ description: 'Maximum retries for failed messages' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  max_retries?: number;

  @ApiPropertyOptional({ description: 'Retry interval in minutes' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1440)
  retry_interval_minutes?: number;

  @ApiPropertyOptional({ description: 'Rate limit per hour' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10000)
  rate_limit_per_hour?: number;
}

export class UpdateWhatsAppCampaignDto {
  @ApiPropertyOptional({ description: 'Campaign name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Campaign description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: ['draft', 'scheduled', 'running', 'completed', 'paused', 'cancelled'], description: 'Campaign status' })
  @IsOptional()
  @IsEnum(['draft', 'scheduled', 'running', 'completed', 'paused', 'cancelled'])
  status?: 'draft' | 'scheduled' | 'running' | 'completed' | 'paused' | 'cancelled';

  @ApiPropertyOptional({ description: 'Template name' })
  @IsOptional()
  @IsString()
  template_name?: string;

  @ApiPropertyOptional({ description: 'Message content' })
  @IsOptional()
  @IsString()
  message_content?: string;

  @ApiPropertyOptional({ description: 'Variable mapping' })
  @IsOptional()
  @IsObject()
  variables_mapping?: Record<string, string>;

  @ApiPropertyOptional({ description: 'Target audience filters' })
  @IsOptional()
  @IsObject()
  target_audience?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Lead filters' })
  @IsOptional()
  @IsObject()
  lead_filters?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Scheduled date and time' })
  @IsOptional()
  @IsDateString()
  scheduled_at?: string;

  @ApiPropertyOptional({ description: 'Maximum retries' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  max_retries?: number;

  @ApiPropertyOptional({ description: 'Retry interval in minutes' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1440)
  retry_interval_minutes?: number;

  @ApiPropertyOptional({ description: 'Rate limit per hour' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10000)
  rate_limit_per_hour?: number;
}

export class WhatsAppCampaignQueryDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsInt()
  page?: number;

  @ApiPropertyOptional({ description: 'Page size', default: 20 })
  @IsOptional()
  @IsInt()
  limit?: number;

  @ApiPropertyOptional({ description: 'Search term' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ['draft', 'scheduled', 'running', 'completed', 'paused', 'cancelled'] })
  @IsOptional()
  @IsEnum(['draft', 'scheduled', 'running', 'completed', 'paused', 'cancelled'])
  status?: string;

  @ApiPropertyOptional({ enum: ['bulk', 'drip', 'triggered'] })
  @IsOptional()
  @IsEnum(['bulk', 'drip', 'triggered'])
  campaign_type?: string;

  @ApiPropertyOptional({ description: 'Start date for filtering' })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiPropertyOptional({ description: 'End date for filtering' })
  @IsOptional()
  @IsDateString()
  end_date?: string;
}

export class CreateWhatsAppDripSequenceDto {
  @ApiProperty({ description: 'Sequence name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Sequence description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Whether the sequence is active' })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiProperty({ enum: ['lead_created', 'status_change', 'manual'], description: 'Enrollment trigger' })
  @IsEnum(['lead_created', 'status_change', 'manual'])
  enrollment_trigger: 'lead_created' | 'status_change' | 'manual';

  @ApiPropertyOptional({ description: 'Trigger conditions' })
  @IsOptional()
  @IsObject()
  trigger_conditions?: Record<string, any>;

  @ApiProperty({ description: 'Sequence steps', type: 'array', items: { type: 'object' } })
  @IsArray()
  steps: Array<{
    step_number: number;
    delay_minutes: number;
    template_name?: string;
    message_content?: string;
    conditions?: Record<string, any>;
  }>;

  @ApiPropertyOptional({ description: 'Maximum enrollments per lead' })
  @IsOptional()
  @IsInt()
  @Min(1)
  max_enrollments_per_lead?: number;

  @ApiPropertyOptional({ description: 'Cooldown days between enrollments' })
  @IsOptional()
  @IsInt()
  @Min(0)
  cooldown_days?: number;
}

export class UpdateWhatsAppDripSequenceDto {
  @ApiPropertyOptional({ description: 'Sequence name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Sequence description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Whether the sequence is active' })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({ enum: ['lead_created', 'status_change', 'manual'] })
  @IsOptional()
  @IsEnum(['lead_created', 'status_change', 'manual'])
  enrollment_trigger?: 'lead_created' | 'status_change' | 'manual';

  @ApiPropertyOptional({ description: 'Trigger conditions' })
  @IsOptional()
  @IsObject()
  trigger_conditions?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Sequence steps' })
  @IsOptional()
  @IsArray()
  steps?: Array<{
    step_number: number;
    delay_minutes: number;
    template_name?: string;
    message_content?: string;
    conditions?: Record<string, any>;
  }>;

  @ApiPropertyOptional({ description: 'Maximum enrollments per lead' })
  @IsOptional()
  @IsInt()
  @Min(1)
  max_enrollments_per_lead?: number;

  @ApiPropertyOptional({ description: 'Cooldown days between enrollments' })
  @IsOptional()
  @IsInt()
  @Min(0)
  cooldown_days?: number;
}

export class CreateWhatsAppTemplateDto {
  @ApiProperty({ description: 'Template name' })
  @IsString()
  name: string;

  @ApiProperty({ enum: ['marketing', 'utility', 'authentication'], description: 'Template category' })
  @IsEnum(['marketing', 'utility', 'authentication'])
  category: 'marketing' | 'utility' | 'authentication';

  @ApiPropertyOptional({ description: 'Template language', default: 'en_US' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ description: 'Template ID from Meta' })
  @IsOptional()
  @IsString()
  template_id?: string;

  @ApiPropertyOptional({ description: 'Header type' })
  @IsOptional()
  @IsString()
  header_type?: string;

  @ApiPropertyOptional({ description: 'Header content' })
  @IsOptional()
  @IsString()
  header_content?: string;

  @ApiProperty({ description: 'Body text content' })
  @IsString()
  body_text: string;

  @ApiPropertyOptional({ description: 'Footer text' })
  @IsOptional()
  @IsString()
  footer_text?: string;

  @ApiPropertyOptional({ description: 'Interactive buttons', type: 'array', items: { type: 'object' } })
  @IsOptional()
  @IsArray()
  buttons?: Array<Record<string, any>>;

  @ApiPropertyOptional({ description: 'Quick replies', type: 'array', items: { type: 'object' } })
  @IsOptional()
  @IsArray()
  quick_replies?: Array<Record<string, any>>;

  @ApiPropertyOptional({ description: 'Template variables', type: 'array', items: { type: 'string' } })
  @IsOptional()
  @IsArray()
  variables?: string[];
}

export class UpdateWhatsAppTemplateDto {
  @ApiPropertyOptional({ description: 'Template name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: ['marketing', 'utility', 'authentication'] })
  @IsOptional()
  @IsEnum(['marketing', 'utility', 'authentication'])
  category?: 'marketing' | 'utility' | 'authentication';

  @ApiPropertyOptional({ description: 'Template language' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ description: 'Template ID from Meta' })
  @IsOptional()
  @IsString()
  template_id?: string;

  @ApiPropertyOptional({ description: 'Template status' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Header type' })
  @IsOptional()
  @IsString()
  header_type?: string;

  @ApiPropertyOptional({ description: 'Header content' })
  @IsOptional()
  @IsString()
  header_content?: string;

  @ApiPropertyOptional({ description: 'Body text content' })
  @IsOptional()
  @IsString()
  body_text?: string;

  @ApiPropertyOptional({ description: 'Footer text' })
  @IsOptional()
  @IsString()
  footer_text?: string;

  @ApiPropertyOptional({ description: 'Interactive buttons' })
  @IsOptional()
  @IsArray()
  buttons?: Array<Record<string, any>>;

  @ApiPropertyOptional({ description: 'Quick replies' })
  @IsOptional()
  @IsArray()
  quick_replies?: Array<Record<string, any>>;

  @ApiPropertyOptional({ description: 'Template variables' })
  @IsOptional()
  @IsArray()
  variables?: string[];
}

export class CreateWhatsAppAutomationRuleDto {
  @ApiProperty({ description: 'Rule name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Rule description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Whether the rule is active' })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiProperty({ enum: ['lead_created', 'lead_assigned', 'lead_status_change', 'message_received'], description: 'Trigger event' })
  @IsEnum(['lead_created', 'lead_assigned', 'lead_status_change', 'message_received'])
  trigger_event: 'lead_created' | 'lead_assigned' | 'lead_status_change' | 'message_received';

  @ApiPropertyOptional({ description: 'Trigger conditions' })
  @IsOptional()
  @IsObject()
  trigger_conditions?: Record<string, any>;

  @ApiProperty({ enum: ['send_message', 'send_template', 'enroll_sequence'], description: 'Action type' })
  @IsEnum(['send_message', 'send_template', 'enroll_sequence'])
  action_type: 'send_message' | 'send_template' | 'enroll_sequence';

  @ApiPropertyOptional({ description: 'Action configuration' })
  @IsOptional()
  @IsObject()
  action_config?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Maximum executions per lead' })
  @IsOptional()
  @IsInt()
  @Min(0)
  max_executions_per_lead?: number;

  @ApiPropertyOptional({ description: 'Cooldown minutes between executions' })
  @IsOptional()
  @IsInt()
  @Min(0)
  cooldown_minutes?: number;

  @ApiPropertyOptional({ description: 'Execution limit per hour' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10000)
  execution_limit_per_hour?: number;

  @ApiPropertyOptional({ description: 'Schedule configuration' })
  @IsOptional()
  @IsObject()
  schedule_config?: Record<string, any>;
}

export class UpdateWhatsAppAutomationRuleDto {
  @ApiPropertyOptional({ description: 'Rule name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Rule description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Whether the rule is active' })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({ enum: ['lead_created', 'lead_assigned', 'lead_status_change', 'message_received'] })
  @IsOptional()
  @IsEnum(['lead_created', 'lead_assigned', 'lead_status_change', 'message_received'])
  trigger_event?: 'lead_created' | 'lead_assigned' | 'lead_status_change' | 'message_received';

  @ApiPropertyOptional({ description: 'Trigger conditions' })
  @IsOptional()
  @IsObject()
  trigger_conditions?: Record<string, any>;

  @ApiPropertyOptional({ enum: ['send_message', 'send_template', 'enroll_sequence'] })
  @IsOptional()
  @IsEnum(['send_message', 'send_template', 'enroll_sequence'])
  action_type?: 'send_message' | 'send_template' | 'enroll_sequence';

  @ApiPropertyOptional({ description: 'Action configuration' })
  @IsOptional()
  @IsObject()
  action_config?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Maximum executions per lead' })
  @IsOptional()
  @IsInt()
  @Min(0)
  max_executions_per_lead?: number;

  @ApiPropertyOptional({ description: 'Cooldown minutes between executions' })
  @IsOptional()
  @IsInt()
  @Min(0)
  cooldown_minutes?: number;

  @ApiPropertyOptional({ description: 'Execution limit per hour' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10000)
  execution_limit_per_hour?: number;

  @ApiPropertyOptional({ description: 'Schedule configuration' })
  @IsOptional()
  @IsObject()
  schedule_config?: Record<string, any>;
}

export class WhatsAppAnalyticsQueryDto {
  @ApiPropertyOptional({ description: 'Metric type' })
  @IsOptional()
  @IsString()
  metric_type?: string;

  @ApiPropertyOptional({ description: 'Start date' })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiPropertyOptional({ description: 'End date' })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiPropertyOptional({ description: 'Campaign ID for filtering' })
  @IsOptional()
  @IsString()
  campaign_id?: string;

  @ApiPropertyOptional({ description: 'Sequence ID for filtering' })
  @IsOptional()
  @IsString()
  sequence_id?: string;

  @ApiPropertyOptional({ description: 'Template ID for filtering' })
  @IsOptional()
  @IsString()
  template_id?: string;
}