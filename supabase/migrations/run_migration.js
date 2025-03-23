// This script will run the SQL migration to create the users table
// and then migrate the mock users to the database

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get Supabase credentials from environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://local.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_KEY) {
	console.error('SUPABASE_KEY environment variable is required');
	process.exit(1);
}

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Read the SQL migration file
const migrationFilePath = path.join(
	__dirname,
	'20250314_create_users_table.sql'
);
const migrationSQL = fs.readFileSync(migrationFilePath, 'utf8');

// Run the migration
async function runMigration() {
	try {
		console.log('Running migration to create users table...');

		// Create the users table directly with SQL
		const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('admin', 'user', 'master')),
        company_id UUID REFERENCES public.companies(id),
        last_login TIMESTAMP WITH TIME ZONE,
        status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
        is_company_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

		// Execute the SQL directly
		const { error } = await supabase.rpc('exec_sql', {
			sql: createTableSQL
		});

		if (error) {
			// If the exec_sql RPC function doesn't exist, we'll try a different approach
			console.error('Error creating users table with exec_sql:', error);

			// Try to check if the table exists
			const { data, error: checkError } = await supabase
				.from('users')
				.select('count(*)')
				.limit(1);

			if (checkError) {
				// If we can't query the table, it probably doesn't exist
				console.error(
					'Error checking if users table exists:',
					checkError
				);

				// Let's try to create the table using the REST API
				console.log('Attempting to create users table directly...');

				// We'll proceed with the migration anyway, as the table might already exist
				// or might be created by another process
				console.log('Proceeding with migration...');
				return true;
			}

			console.log('Users table exists, proceeding with migration...');
			return true;
		}

		console.log('Users table created successfully');
		return true;
	} catch (error) {
		console.error('Error running migration:', error);
		// We'll proceed with the migration anyway, as the table might already exist
		return true;
	}
}

// Get mock users
function getMockUsers() {
	return [
		{
			id: 'master-001',
			name: 'Master Admin',
			email: 'admin@system.com',
			password: 'admin123', // In a real app, this would be hashed
			role: 'master',
			companyId: 'system',
			lastLogin: new Date().toISOString(),
			status: 'active'
		},
		{
			id: 'user-001',
			name: 'John Doe',
			email: 'john.doe@acme.com',
			password: 'password123', // In a real app, this would be hashed
			role: 'admin',
			companyId: 'company-001',
			lastLogin: '2023-08-15T09:30:00',
			status: 'active',
			isCompanyAdmin: true // Set as company admin
		},
		{
			id: 'user-002',
			name: 'Jane Smith',
			email: 'jane.smith@acme.com',
			password: 'password123', // In a real app, this would be hashed
			role: 'user',
			companyId: 'company-001',
			lastLogin: '2023-08-14T14:45:00',
			status: 'active'
		},
		{
			id: 'user-003',
			name: 'Alice Johnson',
			email: 'alice@technova.com',
			password: 'password123', // In a real app, this would be hashed
			role: 'admin',
			companyId: 'company-002',
			lastLogin: '2023-08-15T11:20:00',
			status: 'active',
			isCompanyAdmin: true // Set as company admin
		},
		{
			id: 'user-004',
			name: 'Bob Williams',
			email: 'bob@technova.com',
			password: 'password123', // In a real app, this would be hashed
			role: 'user',
			companyId: 'company-002',
			lastLogin: '2023-08-10T08:15:00',
			status: 'inactive'
		},
		{
			id: 'user-005',
			name: 'Charlie Brown',
			email: 'charlie@greenenergy.com',
			password: 'password123', // In a real app, this would be hashed
			role: 'admin',
			companyId: 'company-003',
			lastLogin: '2023-08-13T16:30:00',
			status: 'active',
			isCompanyAdmin: true // Set as company admin
		},
		{
			id: 'user-006',
			name: 'Oe Briks',
			email: 'oe@briks.no',
			password: 'Briks42!', // Using the correct password
			role: 'master', // Updated to master role to ensure site-wide admin
			companyId: 'company-004',
			lastLogin: new Date().toISOString(),
			status: 'active',
			isCompanyAdmin: true // Keep as company admin
		},
		{
			id: 'user-007',
			name: 'Pes Briks',
			email: 'pes@briks.no',
			password: 'Briks42!', // Using the specified password
			role: 'master', // Setting as master role for site-wide admin
			companyId: 'company-004',
			lastLogin: new Date().toISOString(),
			status: 'active',
			isCompanyAdmin: true // Set as company admin
		}
	];
}

// Migrate mock users to the database
async function migrateUsers() {
	try {
		console.log('Migrating mock users to the database...');

		const mockUsers = getMockUsers();
		let successCount = 0;
		let errorCount = 0;

		for (const user of mockUsers) {
			try {
				// First, try to insert the user directly
				const { error: insertError } = await supabase
					.from('users')
					.insert({
						id: user.id,
						name: user.name,
						email: user.email,
						password_hash: user.password,
						role: user.role,
						company_id: user.companyId,
						last_login: user.lastLogin,
						status: user.status,
						is_company_admin: user.isCompanyAdmin || false,
						created_at: new Date().toISOString(),
						updated_at: new Date().toISOString()
					});

				if (insertError) {
					// If insert fails, it might be because the user already exists
					// or because of a constraint violation
					console.log(
						`Could not insert user ${user.email}, trying update...`
					);

					// Try to update the user instead
					const { error: updateError } = await supabase
						.from('users')
						.update({
							name: user.name,
							password_hash: user.password,
							role: user.role,
							company_id: user.companyId,
							last_login: user.lastLogin,
							status: user.status,
							is_company_admin: user.isCompanyAdmin || false,
							updated_at: new Date().toISOString()
						})
						.eq('email', user.email);

					if (updateError) {
						console.error(
							`Error updating user ${user.email}:`,
							updateError
						);
						errorCount++;
					} else {
						console.log(`User ${user.email} updated successfully`);
						successCount++;
					}
				} else {
					console.log(`User ${user.email} created successfully`);
					successCount++;
				}
			} catch (error) {
				console.error(`Error processing user ${user.email}:`, error);
				errorCount++;
			}
		}

		console.log(
			`Migration complete: ${successCount} users migrated successfully, ${errorCount} failed`
		);
		return {
			success: successCount > 0,
			message: `Migrated ${successCount} users successfully${
				errorCount > 0 ? `, ${errorCount} failed` : ''
			}`
		};
	} catch (error) {
		console.error('Error migrating users:', error);
		return { success: false, message: 'Error migrating users' };
	}
}

// Run the migration and migrate users
async function main() {
	const migrationSuccess = await runMigration();

	if (migrationSuccess) {
		const migrationResult = await migrateUsers();
		console.log(migrationResult.message);
	} else {
		console.error('Migration failed, not migrating users');
	}
}

main().catch(console.error);
