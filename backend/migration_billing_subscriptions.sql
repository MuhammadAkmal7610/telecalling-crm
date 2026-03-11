-- ============================================================
-- Billing & Subscriptions Migration
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Create subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    stripe_plan_id TEXT UNIQUE, -- Stripe plan ID for billing
    price DECIMAL(10,2) NOT NULL,
    billing_interval TEXT NOT NULL, -- 'month', 'year'
    currency TEXT DEFAULT 'USD',
    features JSONB NOT NULL, -- Feature limits and capabilities
    limits JSONB NOT NULL, -- Usage limits (users, leads, storage, etc.)
    trial_days INTEGER DEFAULT 14,
    is_active BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_public ON subscription_plans(is_public);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_stripe ON subscription_plans(stripe_plan_id);

-- 2. Create user subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
    plan_id UUID REFERENCES subscription_plans(id) ON DELETE SET NULL,
    stripe_subscription_id TEXT UNIQUE,
    stripe_customer_id TEXT,
    status TEXT NOT NULL DEFAULT 'trialing', -- 'trialing', 'active', 'past_due', 'canceled', 'unpaid', 'incomplete'
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    trial_start TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    canceled_at TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT false,
    quantity INTEGER DEFAULT 1,
    price DECIMAL(10,2),
    currency TEXT DEFAULT 'USD',
    billing_interval TEXT, -- 'month', 'year'
    auto_renew BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, workspace_id)
);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_org ON user_subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_workspace ON user_subscriptions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe ON user_subscriptions(stripe_subscription_id);

-- 3. Create usage metrics table
CREATE TABLE IF NOT EXISTS usage_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    metric_type TEXT NOT NULL, -- 'users', 'leads', 'calls', 'whatsapp_messages', 'emails', 'storage', 'api_calls'
    metric_value INTEGER NOT NULL DEFAULT 0,
    metric_unit TEXT DEFAULT 'count', -- 'count', 'bytes', 'minutes', 'messages'
    period_type TEXT NOT NULL, -- 'daily', 'monthly', 'yearly'
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, workspace_id, metric_type, period_type, period_start)
);

CREATE INDEX IF NOT EXISTS idx_usage_metrics_org_workspace ON usage_metrics(organization_id, workspace_id);
CREATE INDEX IF NOT EXISTS idx_usage_metrics_type ON usage_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_usage_metrics_period ON usage_metrics(period_type, period_start);

-- 4. Create billing invoices table
CREATE TABLE IF NOT EXISTS billing_invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
    subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE SET NULL,
    stripe_invoice_id TEXT UNIQUE,
    invoice_number TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'open', 'paid', 'void', 'uncollectible'
    currency TEXT DEFAULT 'USD',
    subtotal DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    amount_paid DECIMAL(10,2) DEFAULT 0,
    amount_due DECIMAL(10,2) GENERATED ALWAYS AS (total - amount_paid) STORED,
    due_date TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    description TEXT,
    line_items JSONB DEFAULT '[]', -- Array of line items
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_billing_invoices_org ON billing_invoices(organization_id);
CREATE INDEX IF NOT EXISTS idx_billing_invoices_status ON billing_invoices(status);
CREATE INDEX IF NOT EXISTS idx_billing_invoices_due_date ON billing_invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_billing_invoices_stripe ON billing_invoices(stripe_invoice_id);

-- 5. Create payment methods table
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    stripe_payment_method_id TEXT UNIQUE,
    type TEXT NOT NULL, -- 'card', 'bank_account'
    brand TEXT, -- 'visa', 'mastercard', etc.
    last4 TEXT,
    expiry_month INTEGER,
    expiry_year INTEGER,
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_methods_org ON payment_methods(organization_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_default ON payment_methods(is_default);
CREATE INDEX IF NOT EXISTS idx_payment_methods_stripe ON payment_methods(stripe_payment_method_id);

-- 6. Create usage alerts table
CREATE TABLE IF NOT EXISTS usage_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
    metric_type TEXT NOT NULL,
    alert_type TEXT NOT NULL, -- 'warning', 'critical', 'limit_reached'
    threshold_percentage INTEGER NOT NULL, -- Percentage of limit used
    current_usage INTEGER NOT NULL,
    limit_value INTEGER NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    is_resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usage_alerts_org ON usage_alerts(organization_id);
CREATE INDEX IF NOT EXISTS idx_usage_alerts_type ON usage_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_usage_alerts_unread ON usage_alerts(is_read);

-- 7. Create feature usage tracking table
CREATE TABLE IF NOT EXISTS feature_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    feature_name TEXT NOT NULL,
    action TEXT NOT NULL, -- 'create', 'read', 'update', 'delete', 'send', 'call'
    resource_type TEXT, -- 'lead', 'call', 'email', 'whatsapp_message'
    resource_id TEXT,
    usage_count INTEGER DEFAULT 1,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feature_usage_org ON feature_usage(organization_id);
CREATE INDEX IF NOT EXISTS idx_feature_usage_feature ON feature_usage(feature_name);
CREATE INDEX IF NOT EXISTS idx_feature_usage_user ON feature_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_feature_usage_created ON feature_usage(created_at);

-- 8. RLS Policies for Subscription Plans
CREATE POLICY "subscription_plans_public_access" ON subscription_plans FOR SELECT
USING (is_public = true);

-- 9. RLS Policies for User Subscriptions
CREATE POLICY "user_subscriptions_org_access" ON user_subscriptions FOR ALL
USING (
    organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    )
);

-- 10. RLS Policies for Usage Metrics
CREATE POLICY "usage_metrics_org_access" ON usage_metrics FOR ALL
USING (
    organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    )
);

-- 11. RLS Policies for Billing Invoices
CREATE POLICY "billing_invoices_org_access" ON billing_invoices FOR ALL
USING (
    organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    )
);

-- 12. RLS Policies for Payment Methods
CREATE POLICY "payment_methods_org_access" ON payment_methods FOR ALL
USING (
    organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    )
);

-- 13. RLS Policies for Usage Alerts
CREATE POLICY "usage_alerts_org_access" ON usage_alerts FOR ALL
USING (
    organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    )
);

-- 14. RLS Policies for Feature Usage
CREATE POLICY "feature_usage_org_access" ON feature_usage FOR ALL
USING (
    organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    )
);

-- 15. Insert default subscription plans
INSERT INTO subscription_plans (name, description, price, billing_interval, features, limits, trial_days, sort_order) VALUES
(
    'Starter',
    'Perfect for small teams getting started',
    29.00,
    'month',
    '{
        "leads": true,
        "calls": true,
        "whatsapp": false,
        "email": false,
        "workflows": false,
        "analytics": true,
        "api_access": false,
        "custom_branding": false,
        "priority_support": false
    }'::jsonb,
    '{
        "users": 3,
        "leads_per_month": 500,
        "calls_per_month": 1000,
        "whatsapp_messages_per_month": 0,
        "emails_per_month": 0,
        "storage_gb": 5,
        "api_calls_per_month": 1000,
        "workflows": 0,
        "custom_reports": 0
    }'::jsonb,
    14,
    1
),
(
    'Professional',
    'Great for growing businesses',
    99.00,
    'month',
    '{
        "leads": true,
        "calls": true,
        "whatsapp": true,
        "email": true,
        "workflows": true,
        "analytics": true,
        "api_access": true,
        "custom_branding": false,
        "priority_support": true
    }'::jsonb,
    '{
        "users": 10,
        "leads_per_month": 5000,
        "calls_per_month": 10000,
        "whatsapp_messages_per_month": 2000,
        "emails_per_month": 5000,
        "storage_gb": 50,
        "api_calls_per_month": 10000,
        "workflows": 10,
        "custom_reports": 5
    }'::jsonb,
    14,
    2
),
(
    'Enterprise',
    'Advanced features for large teams',
    299.00,
    'month',
    '{
        "leads": true,
        "calls": true,
        "whatsapp": true,
        "email": true,
        "workflows": true,
        "analytics": true,
        "api_access": true,
        "custom_branding": true,
        "priority_support": true
    }'::jsonb,
    '{
        "users": 50,
        "leads_per_month": 50000,
        "calls_per_month": 100000,
        "whatsapp_messages_per_month": 20000,
        "emails_per_month": 50000,
        "storage_gb": 500,
        "api_calls_per_month": 100000,
        "workflows": 100,
        "custom_reports": 50
    }'::jsonb,
    30,
    3
),
(
    'Unlimited',
    'Everything unlimited for maximum scale',
    999.00,
    'month',
    '{
        "leads": true,
        "calls": true,
        "whatsapp": true,
        "email": true,
        "workflows": true,
        "analytics": true,
        "api_access": true,
        "custom_branding": true,
        "priority_support": true
    }'::jsonb,
    '{
        "users": -1,
        "leads_per_month": -1,
        "calls_per_month": -1,
        "whatsapp_messages_per_month": -1,
        "emails_per_month": -1,
        "storage_gb": -1,
        "api_calls_per_month": -1,
        "workflows": -1,
        "custom_reports": -1
    }'::jsonb,
    30,
    4
);

-- 16. Create function to track usage
CREATE OR REPLACE FUNCTION track_usage(
    p_organization_id UUID,
    p_workspace_id UUID DEFAULT NULL,
    p_metric_type TEXT,
    p_metric_value INTEGER DEFAULT 1,
    p_metric_unit TEXT DEFAULT 'count'
) RETURNS VOID AS $$
DECLARE
    v_period_start TIMESTAMP WITH TIME ZONE;
    v_period_end TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Calculate monthly period
    v_period_start := DATE_TRUNC('month', CURRENT_DATE);
    v_period_end := v_period_start + INTERVAL '1 month' - INTERVAL '1 second';
    
    -- Insert or update usage metrics
    INSERT INTO usage_metrics (
        organization_id,
        workspace_id,
        metric_type,
        metric_value,
        metric_unit,
        period_type,
        period_start,
        period_end
    ) VALUES (
        p_organization_id,
        p_workspace_id,
        p_metric_type,
        p_metric_value,
        p_metric_unit,
        'monthly',
        v_period_start,
        v_period_end
    )
    ON CONFLICT (organization_id, workspace_id, metric_type, period_type, period_start)
    DO UPDATE SET
        metric_value = usage_metrics.metric_value + p_metric_value,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- 17. Create function to check feature limits
CREATE OR REPLACE FUNCTION check_feature_limit(
    p_organization_id UUID,
    p_workspace_id UUID DEFAULT NULL,
    p_feature_name TEXT,
    p_additional_usage INTEGER DEFAULT 1
) RETURNS BOOLEAN AS $$
DECLARE
    v_limit INTEGER;
    v_current_usage INTEGER;
    v_plan_limits JSONB;
BEGIN
    -- Get current plan limits
    SELECT sp.limits INTO v_plan_limits
    FROM user_subscriptions us
    JOIN subscription_plans sp ON us.plan_id = sp.id
    WHERE us.organization_id = p_organization_id
    AND (us.workspace_id IS NULL OR us.workspace_id = p_workspace_id)
    AND us.status IN ('trialing', 'active')
    ORDER BY us.created_at DESC
    LIMIT 1;
    
    -- Get current usage
    SELECT COALESCE(SUM(metric_value), 0) INTO v_current_usage
    FROM usage_metrics
    WHERE organization_id = p_organization_id
    AND (workspace_id = p_workspace_id OR workspace_id IS NULL)
    AND metric_type = p_feature_name
    AND period_type = 'monthly'
    AND period_start = DATE_TRUNC('month', CURRENT_DATE);
    
    -- Get limit for feature
    v_limit := (v_plan_limits->>p_feature_name)::INTEGER;
    
    -- Check if unlimited (-1) or within limit
    RETURN v_limit = -1 OR (v_current_usage + p_additional_usage) <= v_limit;
END;
$$ LANGUAGE plpgsql;

-- 18. Create function to create usage alerts
CREATE OR REPLACE FUNCTION create_usage_alerts() RETURNS TRIGGER AS $$
DECLARE
    v_limit INTEGER;
    v_current_usage INTEGER;
    v_percentage INTEGER;
    v_plan_limits JSONB;
BEGIN
    -- Get current plan limits
    SELECT sp.limits INTO v_plan_limits
    FROM user_subscriptions us
    JOIN subscription_plans sp ON us.plan_id = sp.id
    WHERE us.organization_id = NEW.organization_id
    AND (us.workspace_id IS NULL OR us.workspace_id = NEW.workspace_id)
    AND us.status IN ('trialing', 'active')
    ORDER BY us.created_at DESC
    LIMIT 1;
    
    -- Get limit for metric
    v_limit := (v_plan_limits->>NEW.metric_type)::INTEGER;
    
    -- Skip if unlimited
    IF v_limit = -1 THEN
        RETURN NEW;
    END IF;
    
    -- Calculate percentage
    v_percentage := (NEW.metric_value::FLOAT / v_limit::FLOAT) * 100;
    
    -- Create alerts based on thresholds
    IF v_percentage >= 100 THEN
        INSERT INTO usage_alerts (
            organization_id,
            workspace_id,
            metric_type,
            alert_type,
            threshold_percentage,
            current_usage,
            limit_value,
            message
        ) VALUES (
            NEW.organization_id,
            NEW.workspace_id,
            NEW.metric_type,
            'limit_reached',
            v_percentage,
            NEW.metric_value,
            v_limit,
            'You have reached your limit for ' || NEW.metric_type
        );
    ELSIF v_percentage >= 90 THEN
        INSERT INTO usage_alerts (
            organization_id,
            workspace_id,
            metric_type,
            alert_type,
            threshold_percentage,
            current_usage,
            limit_value,
            message
        ) VALUES (
            NEW.organization_id,
            NEW.workspace_id,
            NEW.metric_type,
            'critical',
            v_percentage,
            NEW.metric_value,
            v_limit,
            'You are at ' || v_percentage || '% of your limit for ' || NEW.metric_type
        );
    ELSIF v_percentage >= 75 THEN
        INSERT INTO usage_alerts (
            organization_id,
            workspace_id,
            metric_type,
            alert_type,
            threshold_percentage,
            current_usage,
            limit_value,
            message
        ) VALUES (
            NEW.organization_id,
            NEW.workspace_id,
            NEW.metric_type,
            'warning',
            v_percentage,
            NEW.metric_value,
            v_limit,
            'You are at ' || v_percentage || '% of your limit for ' || NEW.metric_type
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 19. Create trigger for usage alerts
CREATE TRIGGER create_usage_alerts_trigger
    AFTER INSERT OR UPDATE ON usage_metrics
    FOR EACH ROW EXECUTE FUNCTION create_usage_alerts();

-- 20. Create view for subscription analytics
CREATE OR REPLACE VIEW subscription_analytics AS
SELECT 
    sp.name as plan_name,
    sp.price,
    sp.billing_interval,
    COUNT(us.id) as active_subscriptions,
    SUM(CASE WHEN us.status = 'trialing' THEN 1 ELSE 0 END) as trial_subscriptions,
    SUM(CASE WHEN us.status = 'active' THEN 1 ELSE 0 END) as paid_subscriptions,
    SUM(CASE WHEN us.status = 'canceled' THEN 1 ELSE 0 END) as canceled_subscriptions,
    SUM(sp.price) as monthly_recurring_revenue
FROM subscription_plans sp
LEFT JOIN user_subscriptions us ON sp.id = us.plan_id
WHERE sp.is_active = true
GROUP BY sp.id, sp.name, sp.price, sp.billing_interval;

-- 21. Create view for usage summary
CREATE OR REPLACE VIEW usage_summary AS
SELECT 
    um.organization_id,
    um.workspace_id,
    um.metric_type,
    um.period_start,
    um.metric_value,
    sp.limits->>um.metric_type as limit_value,
    CASE 
        WHEN (sp.limits->>um.metric_type)::INTEGER = -1 THEN 'Unlimited'
        ELSE (sp.limits->>um.metric_type)::INTEGER::TEXT
    END as limit_text,
    CASE 
        WHEN (sp.limits->>um.metric_type)::INTEGER = -1 THEN 0
        ELSE ROUND((um.metric_value::FLOAT / (sp.limits->>um.metric_type)::FLOAT) * 100, 2)
    END as usage_percentage
FROM usage_metrics um
LEFT JOIN user_subscriptions us ON um.organization_id = us.organization_id 
    AND (us.workspace_id IS NULL OR us.workspace_id = um.workspace_id)
    AND us.status IN ('trialing', 'active')
LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE um.period_type = 'monthly'
AND um.period_start = DATE_TRUNC('month', CURRENT_DATE);

-- 22. Add billing configuration to organizations table
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS billing_config JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- 23. Create function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number() RETURNS TEXT AS $$
DECLARE
    invoice_number TEXT;
    sequence_num INTEGER;
BEGIN
    -- Get next sequence number
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM '\d+$') AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM billing_invoices
    WHERE invoice_number ~ '^INV-\d{4}-\d+$';
    
    -- Generate invoice number
    invoice_number := 'INV-' || TO_CHAR(EXTRACT(YEAR FROM NOW()), 'FM0000') || '-' || LPAD(sequence_num::TEXT, 5, '0');
    
    RETURN invoice_number;
END;
$$ LANGUAGE plpgsql;

-- 24. Add billing to integrations seed data
INSERT INTO integrations (organization_id, name, type, status, config) 
SELECT 
    id, 
    'Billing & Payments', 
    'billing', 
    'inactive', 
    '{"stripe": {"publishableKey": "", "secretKey": "", "webhookSecret": ""}, "currency": "USD", "taxRate": 0.00}'::jsonb
FROM organizations 
WHERE id NOT IN (
    SELECT organization_id FROM integrations WHERE type = 'billing'
);

-- Migration complete
SELECT 'Billing and subscriptions migration completed successfully' as status;
