import type { PostgrestError } from '@supabase/supabase-js';
import { toast } from 'sonner';

/**
 * Database error handling utilities for consistent error management
 */

// Type for database operation result
export interface DatabaseResult<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

// Helper function to handle database errors
export const handleDatabaseError = (
  error: PostgrestError | null,
  context: string
): string => {
  if (error) {
    const message = `Error in ${context}: ${error.message}`;
    console.error(message, error);
    toast.error(message);
    return message;
  }
  return '';
};

// Wrapper for database queries to ensure consistent error handling
export const safeQuery = async <T>(
  queryFn: () => Promise<{ data: T | null; error: PostgrestError | null }>,
  context: string
): Promise<DatabaseResult<T>> => {
  try {
    const { data, error } = await queryFn();
    
    if (error) {
      return {
        data: null,
        error: handleDatabaseError(error, context),
        success: false,
      };
    }

    return {
      data,
      error: null,
      success: true,
    };
  } catch (error) {
    const message = `Unexpected error in ${context}: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(message, error);
    toast.error(message);
    
    return {
      data: null,
      error: message,
      success: false,
    };
  }
};

// Helper functions for common query patterns
export const databaseHelpers = {
  // Helper for ordering queries
  orderBy: <T>(query: T, column: string, ascending = true) => {
    if ('order' in (query as any)) {
      return (query as any).order(column, { ascending });
    }
    return query;
  },

  // Helper for pagination
  paginate: <T>(query: T, page: number, pageSize: number) => {
    if ('range' in (query as any)) {
      const start = (page - 1) * pageSize;
      const end = start + pageSize - 1;
      return (query as any).range(start, end);
    }
    return query;
  },

  // Helper for filtering
  filter: <T>(query: T, column: string, value: any) => {
    if ('eq' in (query as any)) {
      return (query as any).eq(column, value);
    }
    return query;
  }
};

// Example usage:
/*
const result = await safeQuery(
  async () => {
    const query = supabase
      .from('sensor_values')
      .select('*');
    
    // Use helpers to build query
    const orderedQuery = databaseHelpers.orderBy(query, 'created_at', false);
    return await orderedQuery;
  },
  'fetchSensorValues'
);
*/