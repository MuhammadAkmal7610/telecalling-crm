# Migration Guide for Telephony and Reporting Features

## Required Migrations

Yes, you need to run migrations to support the new telephony and reporting features we've implemented. Here's what needs to be done:

## 🎯 **Migration Files Created**

### 1. Main Migration: `007_telephony_reporting.sql`
**Location**: `backend/migrations/007_telephony_reporting.sql`

**What it does:**
- ✅ Creates `calls` table for telephony features
- ✅ Creates `call_analytics` table for pre-computed reports
- ✅ Adds missing columns to `tasks` table
- ✅ Adds `stage_id`, `value`, `call_count` to `leads` table
- ✅ Sets up proper indexes and RLS policies
- ✅ Creates triggers for updated_at timestamps
- ✅ Creates call summary view for reporting

### 2. Migration Script: `run-migration-telephony.js`
**Location**: `backend/scripts/run-migration-telephony.js`

**What it does:**
- ✅ Executes the SQL migration
- ✅ Verifies tables were created correctly
- ✅ Checks column additions
- ✅ Validates table structure

## 🚀 **How to Run the Migration**

### Option 1: Using the Node Script (Recommended)
```bash
cd backend
npm install # if you haven't already
node scripts/run-migration-telephony.js
```

### Option 2: Manual SQL Execution
```bash
# Connect to your PostgreSQL database
psql "postgresql://username:password@localhost:5432/your_database"

# Run the migration
\i migrations/007_telephony_reporting.sql
```

### Option 3: Using Supabase Dashboard
1. Go to your Supabase project
2. Navigate to SQL Editor
3. Copy-paste the content of `migrations/007_telephony_reporting.sql`
4. Click "Run"

## 📋 **Migration Checklist**

### Before Running:
- ✅ Backup your database (important!)
- ✅ Ensure your backend is stopped
- ✅ Check you have the correct database credentials

### After Running:
- ✅ Verify tables were created:
  ```sql
  \dt calls
  \dt call_analytics
  ```
- ✅ Check columns were added:
  ```sql
  \d leads
  \d tasks
  ```
- ✅ Test the new features in your application

## 🔍 **What's Being Added**

### New Tables:
1. **calls** - Stores all call records
   - id, lead_id, agent_id, status, duration
   - recording_url, transcript, notes
   - timestamps for tracking

2. **call_analytics** - Pre-computed analytics
   - workspace_id, date, period_type
   - total_calls, connected_calls, talk_time
   - revenue metrics

### Enhanced Tables:
1. **leads** - New columns:
   - `stage_id` (UUID) - Links to lead stages
   - `value` (DECIMAL) - Deal value
   - `call_count` (INTEGER) - Total calls made
   - `total_call_duration` (INTEGER) - Total talk time

2. **tasks** - New columns:
   - `type` (TEXT) - Task type (CallFollowup, Todo)
   - `due_date` (TIMESTAMP) - When task is due
   - `updated_at` (TIMESTAMP) - Last update time

## ⚠️ **Important Notes**

### Database Compatibility:
- ✅ PostgreSQL 12+ compatible
- ✅ Supabase compatible
- ✅ Uses standard SQL with UUID types

### Data Safety:
- ✅ All changes use `IF NOT EXISTS` and `ADD COLUMN IF NOT EXISTS`
- ✅ No data will be lost
- ✅ Backward compatible

### Performance:
- ✅ Indexes added for query performance
- ✅ RLS policies for security
- ✅ Pre-computed analytics table for fast reports

## 🎯 **Post-Migration Testing**

After running the migration, test these features:

1. **Telephony Features:**
   - Navigate to `/dialer` - should load without errors
   - Check if call controls work properly
   - Verify call recording buttons appear

2. **Reporting Features:**
   - Navigate to `/reports` - should show advanced analytics
   - Check `/call-report` - should display call analytics
   - Verify export functionality works

3. **Pipeline Features:**
   - Navigate to `/pipeline` - should work with new stage_id column
   - Test drag-and-drop functionality
   - Verify lead value tracking

## 🔧 **Troubleshooting**

### Common Issues:

1. **Permission Errors:**
   ```sql
   GRANT ALL ON calls TO authenticated;
   GRANT ALL ON call_analytics TO authenticated;
   ```

2. **UUID Function Errors:**
   - Ensure you're using PostgreSQL with `uuid-ossp` extension
   - Run: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`

3. **RLS Policy Errors:**
   - Check your workspace context is properly set
   - Verify `current_setting('app.current_workspace_id')` works

## 📞 **Next Steps**

After migration:
1. ✅ Restart your backend server
2. ✅ Test all telephony features
3. ✅ Verify reporting dashboards load
4. ✅ Check real-time updates work
5. ✅ Test export functionality

## 🎉 **You're Ready!**

Once the migration is complete, you'll have:
- ✅ Full telephony functionality
- ✅ Advanced reporting system
- ✅ Real-time call tracking
- ✅ Professional dialer interface
- ✅ Comprehensive analytics

The migration typically takes less than 30 seconds to run and is completely safe for your existing data.
