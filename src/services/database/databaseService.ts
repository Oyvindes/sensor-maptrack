/**
 * Database Service
 * Provides a standardized interface for database operations with consistent error handling
 */

import { supabase } from '@/integrations/supabase/client';
import { PostgrestError } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { DatabaseResult, safeQuery } from '@/utils/databaseUtils';

/**
 * Generic database service with CRUD operations
 */
export class DatabaseService<T extends Record<string, any>> {
  private tableName: string;
  private primaryKey: string;
  private context: string;

  /**
   * Create a new database service
   * @param tableName The name of the table
   * @param primaryKey The primary key column name
   * @param context The context for error messages
   */
  constructor(tableName: string, primaryKey = 'id', context = '') {
    this.tableName = tableName;
    this.primaryKey = primaryKey;
    this.context = context || tableName;
  }

  /**
   * Get all records from the table
   * @param options Query options
   * @returns Promise with the query result
   */
  async getAll(options: {
    select?: string;
    orderBy?: { column: string; ascending?: boolean };
    limit?: number;
    filters?: Array<{ column: string; value: any; operator?: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' }>;
  } = {}): Promise<DatabaseResult<T[]>> {
    const { select = '*', orderBy, limit, filters } = options;

    return await safeQuery<T[]>(
      async () => {
        let query = supabase
          .from(this.tableName)
          .select(select);

        // Apply filters
        if (filters && filters.length > 0) {
          for (const filter of filters) {
            const { column, value, operator = 'eq' } = filter;
            switch (operator) {
              case 'eq':
                query = query.eq(column, value);
                break;
              case 'neq':
                query = query.neq(column, value);
                break;
              case 'gt':
                query = query.gt(column, value);
                break;
              case 'gte':
                query = query.gte(column, value);
                break;
              case 'lt':
                query = query.lt(column, value);
                break;
              case 'lte':
                query = query.lte(column, value);
                break;
              case 'like':
                query = query.like(column, value);
                break;
            }
          }
        }

        // Apply ordering
        if (orderBy) {
          query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
        }

        // Apply limit
        if (limit) {
          query = query.limit(limit);
        }

        const { data, error } = await query;
        return { data: data as unknown as T[], error };
      },
      `${this.context}.getAll`
    );
  }

  /**
   * Get a record by ID
   * @param id The ID of the record
   * @param select The columns to select
   * @returns Promise with the query result
   */
  async getById(id: string | number, select = '*'): Promise<DatabaseResult<T>> {
    return await safeQuery<T>(
      async () => {
        const { data, error } = await supabase
          .from(this.tableName)
          .select(select)
          .eq(this.primaryKey, id)
          .single();
        return { data: data as unknown as T, error };
      },
      `${this.context}.getById`
    );
  }

  /**
   * Create a new record
   * @param data The data to insert
   * @returns Promise with the query result
   */
  async create(data: Partial<T>): Promise<DatabaseResult<T>> {
    return await safeQuery<T>(
      async () => {
        const { data: insertedData, error } = await supabase
          .from(this.tableName)
          .insert(data)
          .select()
          .single();
        return { data: insertedData as unknown as T, error };
      },
      `${this.context}.create`
    );
  }

  /**
   * Update a record
   * @param id The ID of the record
   * @param data The data to update
   * @returns Promise with the query result
   */
  async update(id: string | number, data: Partial<T>): Promise<DatabaseResult<T>> {
    return await safeQuery<T>(
      async () => {
        const { data: updatedData, error } = await supabase
          .from(this.tableName)
          .update(data)
          .eq(this.primaryKey, id)
          .select()
          .single();
        return { data: updatedData as unknown as T, error };
      },
      `${this.context}.update`
    );
  }

  /**
   * Delete a record
   * @param id The ID of the record
   * @returns Promise with the query result
   */
  async delete(id: string | number): Promise<DatabaseResult<null>> {
    return await safeQuery<null>(
      async () => {
        const { error } = await supabase
          .from(this.tableName)
          .delete()
          .eq(this.primaryKey, id);
        return { data: null, error };
      },
      `${this.context}.delete`
    );
  }

  /**
   * Execute a custom query
   * @param queryFn Function that builds and executes the query
   * @param operationName Name of the operation for error context
   * @returns Promise with the query result
   */
  async customQuery<R>(
    queryFn: () => Promise<{ data: R | null; error: PostgrestError | null }>,
    operationName: string
  ): Promise<DatabaseResult<R>> {
    return await safeQuery<R>(
      queryFn,
      `${this.context}.${operationName}`
    );
  }

  /**
   * Execute a stored procedure or RPC function
   * @param functionName The name of the function
   * @param params The parameters to pass to the function
   * @returns Promise with the query result
   */
  async callFunction<R>(functionName: string, params: Record<string, any> = {}): Promise<DatabaseResult<R>> {
    return await safeQuery<R>(
      async () => {
        const { data, error } = await supabase.rpc(functionName, params);
        return { data: data as unknown as R, error };
      },
      `${this.context}.${functionName}`
    );
  }
}

/**
 * Create a database service for a specific table
 * @param tableName The name of the table
 * @param primaryKey The primary key column name
 * @param context The context for error messages
 * @returns A database service instance
 */
export function createDatabaseService<T extends Record<string, any>>(
  tableName: string,
  primaryKey = 'id',
  context = ''
): DatabaseService<T> {
  return new DatabaseService<T>(tableName, primaryKey, context);
}