// This script runs the migration SQL file against the Supabase database
// Usage: node run-migration.js

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get Supabase URL and key from environment variables or use defaults
const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.VITE_SUPABASE_KEY || 'token';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Get the migration file from command line arguments or use default
const migrationFileName = process.argv[2] || '20250328_fix_tracking_objects_deletion.sql';
console.log(`Using migration file: ${migrationFileName}`);

// Path to the migration file
const migrationFilePath = path.join(
	__dirname,
	'..',
	'migrations',
	migrationFileName
);

async function runMigration() {
	try {
		console.log('Reading migration file...');
		const migrationSql = fs.readFileSync(migrationFilePath, 'utf8');

		console.log('Running migration...');
		const { data, error } = await supabase.rpc('exec_sql', {
			sql: migrationSql
		});

		if (error) {
			console.error('Error running migration:', error);
			return;
		}

		console.log('Migration completed successfully!');
		console.log('Running mock data migration function...');

		// Run the function to migrate mock devices
		const { error: funcError } = await supabase.rpc('migrate_mock_devices');

		if (funcError) {
			console.error(
				'Error running mock data migration function:',
				funcError
			);
			return;
		}

		console.log('Mock data migration completed successfully!');
	} catch (error) {
		console.error('Unexpected error:', error);
	}
}

runMigration();
