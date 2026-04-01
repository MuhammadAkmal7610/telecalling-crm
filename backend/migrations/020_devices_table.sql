-- Migration: Add devices table for web-to-mobile click-to-call bridge
-- This migration adds the devices table to track user devices for call routing

-- Create devices table
CREATE TABLE IF NOT EXISTS devices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Device identification
    device_token TEXT NOT NULL,  -- Unique device identifier (push token or device ID)
    device_type TEXT NOT NULL CHECK (device_type IN ('ios', 'android', 'web')),
    device_name TEXT,
    
    -- Push notification token (for iOS/Android)
    push_token TEXT,
    
    -- Status tracking
    is_active BOOLEAN DEFAULT true,
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_devices_user_id ON devices(user_id);
CREATE INDEX IF NOT EXISTS idx_devices_device_token ON devices(device_token);
CREATE INDEX IF NOT EXISTS idx_devices_is_active ON devices(is_active);
CREATE INDEX IF NOT EXISTS idx_devices_device_type ON devices(device_type);

-- Create composite index for active device lookup
CREATE INDEX IF NOT EXISTS idx_devices_user_active ON devices(user_id, is_active) WHERE is_active = true;

-- Add RLS (Row Level Security) policies
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    -- Users can view their own devices
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'devices' AND policyname = 'Users can view own devices'
    ) THEN
        CREATE POLICY "Users can view own devices" ON devices
            FOR SELECT USING (
                user_id = current_setting('app.current_user_id')::UUID
            );
    END IF;
    
    -- Users can insert their own devices
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'devices' AND policyname = 'Users can insert own devices'
    ) THEN
        CREATE POLICY "Users can insert own devices" ON devices
            FOR INSERT WITH CHECK (
                user_id = current_setting('app.current_user_id')::UUID
            );
    END IF;
    
    -- Users can update their own devices
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'devices' AND policyname = 'Users can update own devices'
    ) THEN
        CREATE POLICY "Users can update own devices" ON devices
            FOR UPDATE USING (
                user_id = current_setting('app.current_user_id')::UUID
            );
    END IF;
    
    -- Users can delete their own devices
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'devices' AND policyname = 'Users can delete own devices'
    ) THEN
        CREATE POLICY "Users can delete own devices" ON devices
            FOR DELETE USING (
                user_id = current_setting('app.current_user_id')::UUID
            );
    END IF;
END $$;

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_devices_updated_at ON devices;
CREATE TRIGGER update_devices_updated_at BEFORE UPDATE ON devices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON devices TO authenticated;

-- Add comment
COMMENT ON TABLE devices IS 'Tracks user devices for web-to-mobile call routing and push notifications';
COMMENT ON COLUMN devices.device_token IS 'Unique device identifier (e.g., Expo push token, Firebase token)';
COMMENT ON COLUMN devices.push_token IS 'Platform-specific push notification token';