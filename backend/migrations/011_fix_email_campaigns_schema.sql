-- Migration: Fix Email Campaigns and Logs Schema
-- Adds missing columns to align with EmailService implementation

-- 1. Fix email_campaigns table
DO $$
BEGIN
    -- Add missing columns to email_campaigns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_campaigns' AND column_name = 'description') THEN
        ALTER TABLE email_campaigns ADD COLUMN description TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_campaigns' AND column_name = 'sender_name') THEN
        -- Rename from_name if it exists, otherwise add sender_name
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_campaigns' AND column_name = 'from_name') THEN
            ALTER TABLE email_campaigns RENAME COLUMN from_name TO sender_name;
        ELSE
            ALTER TABLE email_campaigns ADD COLUMN sender_name VARCHAR(255);
        END IF;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_campaigns' AND column_name = 'sender_email') THEN
        -- Rename from_email if it exists, otherwise add sender_email
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_campaigns' AND column_name = 'from_email') THEN
            ALTER TABLE email_campaigns RENAME COLUMN from_email TO sender_email;
        ELSE
            ALTER TABLE email_campaigns ADD COLUMN sender_email VARCHAR(255);
        END IF;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_campaigns' AND column_name = 'reply_to_email') THEN
        ALTER TABLE email_campaigns ADD COLUMN reply_to_email VARCHAR(255);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_campaigns' AND column_name = 'track_opens') THEN
        ALTER TABLE email_campaigns ADD COLUMN track_opens BOOLEAN DEFAULT TRUE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_campaigns' AND column_name = 'track_clicks') THEN
        ALTER TABLE email_campaigns ADD COLUMN track_clicks BOOLEAN DEFAULT TRUE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_campaigns' AND column_name = 'schedule_type') THEN
        ALTER TABLE email_campaigns ADD COLUMN schedule_type VARCHAR(20) DEFAULT 'immediate';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_campaigns' AND column_name = 'target_audience') THEN
        ALTER TABLE email_campaigns ADD COLUMN target_audience JSONB DEFAULT '{}';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_campaigns' AND column_name = 'bounced_count') THEN
        ALTER TABLE email_campaigns ADD COLUMN bounced_count INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_campaigns' AND column_name = 'unsubscribed_count') THEN
        ALTER TABLE email_campaigns ADD COLUMN unsubscribed_count INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_campaigns' AND column_name = 'created_by') THEN
        ALTER TABLE email_campaigns ADD COLUMN created_by UUID REFERENCES users(id) ON DELETE SET NULL;
    END IF;
    
    -- Update status types if needed (sending vs running)
    -- This is just a comment as we use VARCHAR
END $$;

-- 2. Fix email_logs table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_logs' AND column_name = 'template_id') THEN
        ALTER TABLE email_logs ADD COLUMN template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_logs' AND column_name = 'recipient_email') THEN
        -- Rename recipient if it exists, otherwise add recipient_email
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_logs' AND column_name = 'recipient') THEN
            ALTER TABLE email_logs RENAME COLUMN recipient TO recipient_email;
        ELSE
            ALTER TABLE email_logs ADD COLUMN recipient_email VARCHAR(255);
        END IF;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_logs' AND column_name = 'recipient_name') THEN
        ALTER TABLE email_logs ADD COLUMN recipient_name VARCHAR(255);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_logs' AND column_name = 'subject') THEN
        ALTER TABLE email_logs ADD COLUMN subject TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_logs' AND column_name = 'content') THEN
        ALTER TABLE email_logs ADD COLUMN content TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_logs' AND column_name = 'sent_at') THEN
        ALTER TABLE email_logs ADD COLUMN sent_at TIMESTAMP WITH TIME ZONE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_logs' AND column_name = 'delivered_at') THEN
        ALTER TABLE email_logs ADD COLUMN delivered_at TIMESTAMP WITH TIME ZONE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_logs' AND column_name = 'bounced_at') THEN
        ALTER TABLE email_logs ADD COLUMN bounced_at TIMESTAMP WITH TIME ZONE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_logs' AND column_name = 'unsubscribed_at') THEN
        ALTER TABLE email_logs ADD COLUMN unsubscribed_at TIMESTAMP WITH TIME ZONE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_logs' AND column_name = 'external_id') THEN
        ALTER TABLE email_logs ADD COLUMN external_id VARCHAR(255);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_logs' AND column_name = 'tracking_id') THEN
        ALTER TABLE email_logs ADD COLUMN tracking_id VARCHAR(255);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_logs' AND column_name = 'variables_used') THEN
        ALTER TABLE email_logs ADD COLUMN variables_used JSONB DEFAULT '{}';
    END IF;
END $$;
