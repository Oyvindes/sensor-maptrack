// This script runs the migration SQL file against the Supabase database
// Usage: node run-migration.js

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Get Supabase URL and key from environment variables or use defaults
const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.VITE_SUPABASE_KEY || 'token';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Path to the migration file
const migrationFilePath = path.join(
	__dirname,
	'..',
	'migrations',
	'20250317_add_devices_table.sql'
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
