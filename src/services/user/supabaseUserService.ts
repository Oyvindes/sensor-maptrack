import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/users';
import { getMockUsers } from './userService';
import { toast } from 'sonner';
import { SupabaseFunction } from '@/types/supabase';

/**
 * Get all users from the database
 */
export const getUsers = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*');

    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }

    return data.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password_hash, // Note: In a real app, passwords should never be returned
      role: user.role as 'admin' | 'user' | 'master',
      companyId: user.company_id,
      lastLogin: user.last_login,
      status: user.status as 'active' | 'inactive',
      isCompanyAdmin: user.is_company_admin
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

/**
 * Save a user to the database
 */
export const saveUser = async (user: User): Promise<{ success: boolean; message: string; data?: User }> => {
  try {
    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', user.email)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking if user exists:', checkError);
      return { success: false, message: 'Error checking if user exists' };
    }

    if (existingUser) {
      // Update existing user
      const { error } = await supabase
        .from('users')
        .update({
          name: user.name,
          email: user.email,
          password_hash: user.password, // In a real app, this would be hashed
          role: user.role,
          company_id: user.companyId,
          last_login: user.lastLogin,
          status: user.status,
          is_company_admin: user.isCompanyAdmin || false,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingUser.id);

      if (error) {
        console.error('Error updating user:', error);
        return { success: false, message: 'Error updating user' };
      }

      return { 
        success: true, 
        message: 'User updated successfully',
        data: user
      };
    } else {
      // Create new user
      // If the ID starts with "user-", it's a temporary ID and we should let the database generate a UUID
      const insertData = {
        name: user.name,
        email: user.email,
        password_hash: user.password, // In a real app, this would be hashed
        role: user.role,
        company_id: user.companyId,
        last_login: user.lastLogin,
        status: user.status,
        is_company_admin: user.isCompanyAdmin || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Only include the ID if it's not a temporary ID
      if (!user.id.startsWith('user-')) {
        (insertData as any).id = user.id;
      }

      const { data, error } = await supabase
        .from('users')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Error creating user:', error);
        return { success: false, message: 'Error creating user' };
      }

      return { 
        success: true, 
        message: 'User created successfully',
        data: {
          id: data.id,
          name: data.name,
          email: data.email,
          password: data.password_hash,
          role: data.role as 'admin' | 'user' | 'master',
          companyId: data.company_id,
          lastLogin: data.last_login,
          status: data.status as 'active' | 'inactive',
          isCompanyAdmin: data.is_company_admin
        }
      };
    }
  } catch (error) {
    console.error('Error saving user:', error);
    return { success: false, message: 'Error saving user' };
  }
};

/**
 * Delete a user from the database
 */
export const deleteUser = async (userId: string): Promise<{ success: boolean; message: string }> => {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Error deleting user:', error);
      return { success: false, message: 'Error deleting user' };
    }

    return { success: true, message: 'User deleted successfully' };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, message: 'Error deleting user' };
  }
};

/**
 * Migrate mock users to the database
 */
export const migrateMockUsersToDB = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const mockUsers = getMockUsers();
    let successCount = 0;
    let errorCount = 0;

    // Create the users table if it doesn't exist
    const { error: createTableError } = await supabase.rpc(
      'create_users_table_if_not_exists' as SupabaseFunction
    );
    
    if (createTableError) {
      console.error('Error creating users table:', createTableError);
      return { success: false, message: 'Error creating users table' };
    }

    // Save each mock user to the database
    for (const user of mockUsers) {
      const result = await saveUser(user);
      if (result.success) {
        successCount++;
      } else {
        errorCount++;
        console.error(`Error saving user ${user.email}:`, result.message);
      }
    }

    return { 
      success: successCount > 0, 
      message: `Migrated ${successCount} users successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}`
    };
  } catch (error) {
    console.error('Error migrating mock users to DB:', error);
    return { success: false, message: 'Error migrating mock users to DB' };
  }
};

/**
 * Get a user by email and password (for login)
 */
export const getUserByCredentials = async (email: string, password: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('password_hash', password) // In a real app, this would use proper password verification
      .eq('status', 'active')
      .maybeSingle();

    if (error || !data) {
      console.error('Error fetching user by credentials:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      password: data.password_hash,
      role: data.role as 'admin' | 'user' | 'master',
      companyId: data.company_id,
      lastLogin: data.last_login,
      status: data.status as 'active' | 'inactive',
      isCompanyAdmin: data.is_company_admin
    };
  } catch (error) {
    console.error('Error fetching user by credentials:', error);
    return null;
  }
};

/**
 * Update a user's last login time
 */
export const updateUserLastLogin = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user last login:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating user last login:', error);
    return false;
  }
};
