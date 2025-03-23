import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Default configuration (for development only)
const DEFAULT_SUPABASE_URL = 'http://localhost:8080';

// Get environment variables with fallbacks
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_KEY;

// Log environment status (only in development)
if (import.meta.env.DEV) {
	if (!import.meta.env.VITE_SUPABASE_URL) {
		console.warn(
			'⚠️ Using default Supabase URL. Set VITE_SUPABASE_URL for production.'
		);
	}
	if (!import.meta.env.VITE_SUPABASE_KEY) {
		console.error('❌ Missing VITE_SUPABASE_KEY environment variable.');
	}
}

// Validate Supabase key
if (!SUPABASE_ANON_KEY) {
	throw new Error(
		'Missing VITE_SUPABASE_KEY environment variable. Please check your .env file.'
	);
}

// Initialize the Supabase client
const client = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
	auth: {
		autoRefreshToken: true,
		persistSession: true,
		storageKey: 'app-storage-key'
	},
	global: {
		headers: { 'x-application-name': 'sensor-maptrack' }
	}
});

// Export the client
export const supabase = client;

// Prevent modification after export
Object.freeze(supabase);

// Add runtime check to ensure the client is working (only in development)
if (import.meta.env.DEV) {
	(async () => {
		try {
			const { data, error } = await supabase
				.from('companies')
				.select('id')
				.limit(1);

			if (error) {
				console.error(
					'❌ Database connection test failed:',
					error.message
				);
			} else {
				console.log('✅ Database connection test successful');
			}
		} catch (error) {
			console.error('❌ Database connection test failed:', error);
		}
	})();
}

// Error handling utilities
export const DatabaseError = {
	handle: (error: unknown, context: string) => {
		if (error instanceof Error) {
			console.error(`Database error in ${context}:`, error.message);
			return error.message;
		}
		const message = `Unknown database error in ${context}`;
		console.error(message, error);
		return message;
	},

	log: (error: unknown, operation: string, table: string) => {
		if (error) {
			console.error(`Database error in ${table}.${operation}:`, error);
			// You could add error tracking service here (e.g., Sentry)
		}
	}
};
