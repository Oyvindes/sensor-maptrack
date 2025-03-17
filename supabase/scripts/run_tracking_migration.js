// Script to run the tracking columns migration

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Get the migration file path
const migrationFilePath = path.join(__dirname, '../migrations/20250317_add_tracking_columns_to_purchases.sql');

// Check if the migration file exists
if (!fs.existsSync(migrationFilePath)) {
  console.error('Migration file not found:', migrationFilePath);
  process.exit(1);
}

console.log('Running migration to add tracking columns to purchases table...');

try {
  // Run the migration using the Supabase CLI
  execSync(`npx supabase db push --db-url ${process.env.DATABASE_URL} --file ${migrationFilePath}`, {
    stdio: 'inherit'
  });
  
  console.log('Migration completed successfully!');
} catch (error) {
  console.error('Error running migration:', error.message);
  process.exit(1);
}