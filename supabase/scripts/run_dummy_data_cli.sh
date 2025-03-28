#!/bin/bash

# Script to run the power sensor dummy data SQL file using Supabase CLI

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "Error: Supabase CLI is not installed."
    echo "Please install it by following the instructions at:"
    echo "https://supabase.com/docs/guides/cli/getting-started"
    exit 1
fi

# Path to the SQL file
SQL_FILE="./supabase/scripts/insert_power_sensor_dummy_data.sql"

# Check if the SQL file exists
if [ ! -f "$SQL_FILE" ]; then
    echo "Error: SQL file not found at $SQL_FILE"
    exit 1
fi

echo "Running power sensor dummy data script..."

# Run the SQL file using Supabase CLI
supabase db execute --file "$SQL_FILE"

echo "Script execution completed."