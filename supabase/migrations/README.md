# Database Migrations

This directory contains database migration scripts for the Supabase database.

## Migration: Add Time to Project Dates

The migration script `20250323_add_time_to_project_dates.sql` changes the `project_start_date` and `project_end_date` columns in the `sensor_folders` table from `date` type to `timestamptz` type. This allows storing both date and time information, rather than just the date.

### Why This Change?

Previously, when setting a project start or end date with a specific time, only the date part was saved to the database. This meant that time information was lost when reloading the page. By changing the column types to `timestamptz`, we can now store and retrieve the full date and time information.

### Timezone Handling

The database stores timestamps in UTC timezone (indicated by the "+00" suffix in the database). The frontend displays dates in the local timezone (e.g., Europe/Oslo, which is UTC+1). This is the correct behavior:

1. When a user selects a date and time in the frontend, it's converted to UTC before being saved to the database.
2. When the date is loaded from the database, it's converted from UTC to the local timezone for display.

This ensures consistent time handling regardless of the user's location or timezone.

### How to Apply the Migration

To apply this migration, you can use the Supabase CLI:

```bash
# Navigate to the project root
cd /path/to/your/project

# Apply the migration
supabase db push
```

Or, if you prefer to apply the migration manually:

1. Connect to your Supabase database using psql or another PostgreSQL client
2. Run the SQL commands in the migration script

```sql
-- First, alter the project_start_date column
ALTER TABLE sensor_folders 
ALTER COLUMN project_start_date TYPE timestamptz 
USING project_start_date::timestamptz;

-- Then, alter the project_end_date column
ALTER TABLE sensor_folders 
ALTER COLUMN project_end_date TYPE timestamptz 
USING project_end_date::timestamptz;

-- Add a comment to explain the change
COMMENT ON COLUMN sensor_folders.project_start_date IS 'Project start date and time (timestamp with timezone)';
COMMENT ON COLUMN sensor_folders.project_end_date IS 'Project end date and time (timestamp with timezone)';
```

### After Migration

After applying the migration, the application will automatically start saving and retrieving the full date and time information for project start and end dates. No changes to the application code are needed, as we've already updated the code to handle the full ISO string with time information.