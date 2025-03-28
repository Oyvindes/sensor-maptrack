# Power Sensor Dummy Data

This directory contains scripts to generate and insert dummy data for power sensors into your Supabase database.

## Files

- `insert_power_sensor_dummy_data.sql`: SQL script that inserts dummy data for power sensors, power status, power consumption, and audit logs.
- `run_dummy_data_script.js`: JavaScript script to execute the SQL file against your Supabase database.
- `run_dummy_data_cli.sh`: Bash script to execute the SQL file using the Supabase CLI.

## How to Use

### Option 1: Run via Supabase Studio

1. Open your Supabase project in the browser
2. Go to the SQL Editor
3. Copy the contents of `insert_power_sensor_dummy_data.sql`
4. Paste into the SQL Editor
5. Click "Run" to execute the script

### Option 2: Run via Node.js Script

1. Make sure you have the required environment variables set in your `.env` file:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. Run the script:
   ```bash
   node supabase/scripts/run_dummy_data_script.js
   ```

### Option 3: Run via Supabase CLI

1. Make sure you have the Supabase CLI installed and configured.

2. Make the script executable:
   ```bash
   chmod +x supabase/scripts/run_dummy_data_cli.sh
   ```

3. Run the script:
   ```bash
   ./supabase/scripts/run_dummy_data_cli.sh
   ```

## What Data is Generated

The script generates the following dummy data:

1. **Power Sensors**: Creates 6 power sensors with different names, IMEIs, and statuses.
2. **Power Status**: Creates power status records for each sensor.
3. **Power Consumption**: Generates hourly power consumption data for the past week with realistic patterns:
   - Kitchen devices use more power during meal times
   - Living room devices use more power in the evening
   - Other devices have random consumption patterns
4. **Audit Log**: Creates audit log entries for power toggle operations.

## Sample Queries

The SQL script includes sample queries at the end that you can use to test the data:

1. Get power consumption by sensor for the past day
2. Get hourly consumption for the Kitchen Smart Plug
3. Get current power status for all sensors

## Customizing the Data

You can modify the SQL script to:

- Change the number of sensors
- Adjust the time range for consumption data
- Modify the consumption patterns
- Add more types of audit log entries

## Troubleshooting

If you encounter errors when running the script:

1. Check that your database has the required tables (`power_sensors`, `power_status`, `power_consumption`, `power_audit_log`)
2. Ensure you have at least one company record in the `companies` table
3. Make sure you have at least one admin user in the `users` table
4. Check the Supabase logs for detailed error messages