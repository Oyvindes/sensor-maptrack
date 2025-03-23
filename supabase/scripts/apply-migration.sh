#!/bin/bash

# Script to apply the migration to add time to project dates

# Navigate to the project root
cd "$(dirname "$0")/../.."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "Supabase CLI is not installed. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Apply the migration
echo "Applying migration to add time to project dates..."
supabase db push

# Check if the migration was successful
if [ $? -eq 0 ]; then
    echo "Migration applied successfully!"
    echo "The project_start_date and project_end_date columns now store both date and time information."
else
    echo "Failed to apply migration. Please check the error message above."
    exit 1
fi

echo "Done!"