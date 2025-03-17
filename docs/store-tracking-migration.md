# Store Tracking Migration

This document provides instructions for adding tracking functionality to the store purchases.

## Background

The store functionality allows company admins to purchase sensors and site-wide admins to manage these purchases. The tracking functionality enables site-wide admins to add tracking information (tracking number, carrier, and shipped date) to purchases.

## Required Database Migration

The tracking functionality requires additional columns in the `purchases` table:

- `tracking_number`: For storing package tracking numbers
- `carrier`: For storing the shipping carrier (e.g., DHL, FedEx)
- `shipped_date`: For storing when the package was shipped

A migration file has been created to add these columns to the database.

## Running the Migration

### Option 1: Using the Migration Script

1. Make sure you have the Supabase CLI installed:
   ```
   npm install -g supabase
   ```

2. Navigate to the project root directory and run:
   ```
   node supabase/scripts/run_tracking_migration.js
   ```

### Option 2: Manual Migration

1. Connect to your Supabase database using the SQL editor or psql.

2. Run the following SQL commands:

   ```sql
   -- Add tracking_number column
   ALTER TABLE purchases ADD COLUMN IF NOT EXISTS tracking_number TEXT;

   -- Add carrier column
   ALTER TABLE purchases ADD COLUMN IF NOT EXISTS carrier TEXT;

   -- Add shipped_date column
   ALTER TABLE purchases ADD COLUMN IF NOT EXISTS shipped_date TIMESTAMPTZ;

   -- Add comments for the new columns
   COMMENT ON COLUMN purchases.tracking_number IS 'Tracking number for shipped purchases';
   COMMENT ON COLUMN purchases.carrier IS 'Shipping carrier (e.g., DHL, FedEx)';
   COMMENT ON COLUMN purchases.shipped_date IS 'Date when the purchase was shipped';

   -- Create index for tracking_number
   CREATE INDEX IF NOT EXISTS purchases_tracking_number_idx ON purchases (tracking_number);
   ```

## Verifying the Migration

After running the migration, you can verify that the columns were added successfully by:

1. Checking the database schema in the Supabase dashboard
2. Testing the tracking functionality in the admin interface
3. Running a test query:

   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'purchases' 
   AND column_name IN ('tracking_number', 'carrier', 'shipped_date');
   ```

## Troubleshooting

If you encounter errors related to missing columns:

1. Verify that the migration was run successfully
2. Check the Supabase logs for any errors during the migration
3. Ensure that the database user has the necessary permissions to alter tables

For any issues, please contact the development team.