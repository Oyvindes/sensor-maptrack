// Script to run the order references migration

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the migration file path
const migrationFilePath = path.join(__dirname, '../migrations/20250317_add_order_references_to_purchases.sql');

// Check if the migration file exists
if (!fs.existsSync(migrationFilePath)) {
  console.error('Migration file not found:', migrationFilePath);
  process.exit(1);
}

console.log('Running migration to add order references to purchases table...');

try {
  // Read the SQL file content
  const sqlContent = fs.readFileSync(migrationFilePath, 'utf8');
  
  console.log('Executing SQL migration directly...');
  console.log('SQL file content:');
  console.log('----------------------------------------');
  console.log(sqlContent);
  console.log('----------------------------------------');
  
  console.log('\nTo apply this migration:');
  console.log('1. Open the Supabase dashboard');
  console.log('2. Go to the SQL Editor');
  console.log('3. Paste the SQL content above');
  console.log('4. Run the SQL commands');
  
  console.log('\nAfter running the migration:');
  console.log('- customer_reference: For customer-provided reference numbers');
  console.log('- order_reference: Auto-generated unique reference (format: YYMM-CCC-NNNN)');
  
  // For local development with direct database access, you could use:
  // execSync(`psql -d your_database_name -f ${migrationFilePath}`, { stdio: 'inherit' });
} catch (error) {
  console.error('Error reading migration file:', error.message);
  process.exit(1);
}