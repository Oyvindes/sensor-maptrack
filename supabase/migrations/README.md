# Database Migrations

This directory contains SQL migration files for the Supabase database.

## Migration Files

- `20250317_add_devices_table.sql`: Creates the `devices` and `device_positions` tables, and adds the `folder_id` column to the `tracking_objects` table.

## Running Migrations

There are two ways to run the migrations:

### 1. Using the Supabase Dashboard

1. Go to the Supabase Dashboard
2. Navigate to the SQL Editor
3. Copy the contents of the migration file
4. Paste into the SQL Editor
5. Click "Run"

### 2. Using the Script

We've provided a script to run the migrations programmatically:

```bash
# Install dependencies if needed
npm install @supabase/supabase-js

# Set environment variables (optional)
# export SUPABASE_URL=your_supabase_url
# export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Run the migration
node ../scripts/run-migration.js
```

## What the Migration Does

The `20250317_add_devices_table.sql` migration:

1. Creates a `devices` table with the following columns:
   - `id`: UUID primary key
   - `name`: Device name
   - `type`: Device type
   - `status`: Device status (online, offline, maintenance, warning)
   - `company_id`: Reference to companies table
   - `location`: JSON object with lat/lng coordinates
   - `imei`: Device IMEI number
   - `folder_id`: Reference to sensor_folders table
   - `last_seen`: Timestamp of when the device was last seen
   - `created_at`: Creation timestamp
   - `updated_at`: Last update timestamp

2. Adds a `folder_id` column to the `tracking_objects` table if it doesn't exist

3. Creates a `device_positions` table for storing historical position data:
   - `id`: UUID primary key
   - `device_id`: Reference to devices table
   - `latitude`: Latitude coordinate
   - `longitude`: Longitude coordinate
   - `speed`: Device speed
   - `direction`: Device direction
   - `battery_level`: Device battery level
   - `created_at`: Creation timestamp

4. Creates a function `migrate_mock_devices()` to populate the tables with sample data

## After Running the Migration

After running the migration, the application should use data from the database instead of mock data for devices and tracking objects.