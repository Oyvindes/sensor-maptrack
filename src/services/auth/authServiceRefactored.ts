/**
 * Authentication Service (Refactored)
 * Provides secure authentication functionality with proper error handling
 */

import { supabase } from '@/integrations/supabase/client';
import { User, LoginCredentials } from '@/types/users';
import { ErrorService, ErrorSeverity, ErrorSource } from '@/services/error/errorService';
import { createDatabaseService } from '@/services/database/databaseService';

// Database user type (matches database schema)
interface DbUser {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'user' | 'master';
  company_id: string;
  last_login: string;
  status: 'active' | 'inactive';
  is_company_admin: boolean;
  created_at: string;
  updated_at: string;
}

// Create a database service for users
const userDb = createDatabaseService<DbUser>('users', 'id', 'AuthService');

// Authentication state
interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  authToken: string | null;
}

// Initial state
const initialState: AuthState = {
  currentUser: null,
  isAuthenticated: false,
  authToken: null
};

// Current authentication state
let authState = { ...initialState };

// Token storage key
const TOKEN_STORAGE_KEY = 'auth_token';
const USER_STORAGE_KEY = 'auth_user';

/**
 * Convert database user to application user
 * @param dbUser Database user
 * @returns Application user
 */
const mapDbUserToUser = (dbUser: DbUser): User => {
  return {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    password: '********', // Don't expose password
    role: dbUser.role,
    companyId: dbUser.company_id,
    lastLogin: dbUser.last_login,
    status: dbUser.status,
    isCompanyAdmin: dbUser.is_company_admin
  };
};

/**
 * Convert application user to database user
 * @param user Application user
 * @returns Database user
 */
const mapUserToDbUser = (user: Omit<User, 'id'>, id?: string): Partial<DbUser> => {
  return {
    ...(id && { id }),
    name: user.name,
    email: user.email,
    password_hash: user.password, // In a real app, this would be hashed
    role: user.role,
    company_id: user.companyId,
    status: user.status,
    is_company_admin: user.isCompanyAdmin || false,
    last_login: user.lastLogin || new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};

/**
 * Initialize the authentication service
 * Checks for existing tokens and restores the session if possible
 */
export const initializeAuthService = async (): Promise<void> => {
  try {
    // Check for existing token in sessionStorage (more secure than localStorage)
    const storedToken = sessionStorage.getItem(TOKEN_STORAGE_KEY);
    const storedUser = sessionStorage.getItem(USER_STORAGE_KEY);
    
    if (storedToken && storedUser) {
      try {
        // Verify the token with Supabase
        const { data, error } = await supabase.auth.getUser(storedToken);
        
        if (error || !data.user) {
          // Token is invalid, clear storage
          clearAuthData();
          return;
        }
        
        // Parse the stored user
        const user = JSON.parse(storedUser) as User;
        
        // Update the auth state
        authState = {
          currentUser: user,
          isAuthenticated: true,
          authToken: storedToken
        };
        
        console.log('User session restored from storage');
      } catch (error) {
        // Error parsing stored user or verifying token
        ErrorService.handleError(
          ErrorService.createAuthError(
            'Failed to restore authentication session',
            'initializeAuthService',
            { tokenExists: !!storedToken },
            error
          ),
          false // Don't notify user of this error
        );
        
        // Clear invalid data
        clearAuthData();
      }
    }
  } catch (error) {
    ErrorService.handleError(
      ErrorService.createAuthError(
        'Error initializing authentication service',
        'initializeAuthService',
        {},
        error
      ),
      false // Don't notify user of this error
    );
  }
};

/**
 * Clear authentication data from storage and state
 */
const clearAuthData = (): void => {
  sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  sessionStorage.removeItem(USER_STORAGE_KEY);
  authState = { ...initialState };
};

/**
 * Store authentication data securely
 * @param user User object
 * @param token Authentication token
 */
const storeAuthData = (user: User, token: string): void => {
  // Store token in sessionStorage (more secure than localStorage)
  sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
  
  // Store user without sensitive data
  const userToStore = { ...user };
  delete userToStore.password; // Don't store password
  
  sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userToStore));
  
  // Update auth state
  authState = {
    currentUser: user,
    isAuthenticated: true,
    authToken: token
  };
};

/**
 * Login with email and password
 * @param credentials Login credentials
 * @returns Login result
 */
export const login = async (
  credentials: LoginCredentials
): Promise<{ success: boolean; user?: User; message: string }> => {
  try {
    console.log('Login attempt with:', credentials.email);
    
    // First, try to authenticate with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password
    });
    
    if (authError || !authData.session) {
      // If Supabase auth fails, try the legacy authentication
      return await legacyLogin(credentials);
    }
    
    // Get the user from the database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', credentials.email)
      .single();
    
    if (userError || !userData) {
      ErrorService.handleError(
        ErrorService.createAuthError(
          'User authenticated but not found in database',
          'login',
          { email: credentials.email },
          userError
        )
      );
      
      return {
        success: false,
        message: 'User not found in database'
      };
    }
    
    // Map database user to User type
    const user = mapDbUserToUser(userData as DbUser);
    
    // Update user's last login time
    await updateUserLastLogin(user.id);
    
    // Store authentication data
    storeAuthData(user, authData.session.access_token);
    
    return {
      success: true,
      user,
      message: 'Login successful'
    };
  } catch (error) {
    const structuredError = ErrorService.createAuthError(
      'Error during login',
      'login',
      { email: credentials.email },
      error
    );
    
    ErrorService.handleError(structuredError);
    
    return {
      success: false,
      message: 'An error occurred during login'
    };
  }
};

/**
 * Legacy login method for backward compatibility
 * @param credentials Login credentials
 * @returns Login result
 */
const legacyLogin = async (
  credentials: LoginCredentials
): Promise<{ success: boolean; user?: User; message: string }> => {
  try {
    // Get user from database by credentials
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', credentials.email)
      .eq('password_hash', credentials.password) // In a real app, this would use proper password verification
      .eq('status', 'active')
      .single();
    
    if (error || !data) {
      return {
        success: false,
        message: 'Invalid email or password'
      };
    }
    
    // Map database user to User type
    const user = mapDbUserToUser(data as DbUser);
    
    // Update user's last login time
    await updateUserLastLogin(user.id);
    
    // Generate a pseudo-token for legacy auth
    const pseudoToken = `legacy_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    
    // Store authentication data
    storeAuthData(user, pseudoToken);
    
    return {
      success: true,
      user,
      message: 'Login successful (legacy mode)'
    };
  } catch (error) {
    const structuredError = ErrorService.createAuthError(
      'Error during legacy login',
      'legacyLogin',
      { email: credentials.email },
      error
    );
    
    ErrorService.handleError(structuredError);
    
    return {
      success: false,
      message: 'An error occurred during login'
    };
  }
};

/**
 * Update a user's last login time
 * @param userId User ID
 * @returns Success status
 */
const updateUserLastLogin = async (userId: string): Promise<boolean> => {
  try {
    const { success, error } = await userDb.update(userId, {
      last_login: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
    if (!success) {
      ErrorService.handleError(
        ErrorService.createDatabaseError(
          'Failed to update user last login time',
          'updateUserLastLogin',
          { userId },
          error
        ),
        false // Don't notify user of this error
      );
    }
    
    return success;
  } catch (error) {
    ErrorService.handleError(
      ErrorService.createDatabaseError(
        'Error updating user last login time',
        'updateUserLastLogin',
        { userId },
        error
      ),
      false // Don't notify user of this error
    );
    
    return false;
  }
};

/**
 * Logout the current user
 * @returns Logout result
 */
export const logout = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    // If using Supabase auth, sign out
    if (authState.authToken && !authState.authToken.startsWith('legacy_')) {
      await supabase.auth.signOut();
    }
    
    // Clear auth data
    clearAuthData();
    
    return {
      success: true,
      message: 'Logout successful'
    };
  } catch (error) {
    const structuredError = ErrorService.createAuthError(
      'Error during logout',
      'logout',
      {},
      error
    );
    
    ErrorService.handleError(structuredError);
    
    return {
      success: false,
      message: 'An error occurred during logout'
    };
  }
};

/**
 * Get the current authenticated user
 * @returns Current user or null if not authenticated
 */
export const getCurrentUser = (): User | null => {
  return authState.currentUser;
};

/**
 * Check if a user is authenticated
 * @returns Authentication status
 */
export const isUserAuthenticated = (): boolean => {
  return authState.isAuthenticated;
};

/**
 * Get the current authentication token
 * @returns Authentication token or null if not authenticated
 */
export const getAuthToken = (): string | null => {
  return authState.authToken;
};

/**
 * Register a new user
 * @param user User data
 * @returns Registration result
 */
export const registerUser = async (
  user: Omit<User, 'id'>
): Promise<{ success: boolean; user?: User; message: string }> => {
  try {
    // First, create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: user.email,
      password: user.password,
      options: {
        data: {
          name: user.name,
          role: user.role,
          company_id: user.companyId,
          status: user.status
        }
      }
    });
    
    if (authError || !authData.user) {
      ErrorService.handleError(
        ErrorService.createAuthError(
          'Failed to create user in Supabase Auth',
          'registerUser',
          { email: user.email },
          authError
        )
      );
      
      return {
        success: false,
        message: authError?.message || 'Failed to create user'
      };
    }
    
    // Then create the user in our database
    const dbUser = mapUserToDbUser(user, authData.user.id);
    const { success, data, error } = await userDb.create(dbUser);
    
    if (!success || !data) {
      ErrorService.handleError(
        ErrorService.createDatabaseError(
          'Failed to create user in database',
          'registerUser',
          { email: user.email },
          error
        )
      );
      
      // Try to clean up the Supabase Auth user
      await supabase.auth.admin.deleteUser(authData.user.id);
      
      return {
        success: false,
        message: 'Failed to create user in database'
      };
    }
    
    // Map database user to User type
    const createdUser = mapDbUserToUser(data);
    
    return {
      success: true,
      user: createdUser,
      message: 'User registered successfully'
    };
  } catch (error) {
    const structuredError = ErrorService.createAuthError(
      'Error during user registration',
      'registerUser',
      { email: user.email },
      error
    );
    
    ErrorService.handleError(structuredError);
    
    return {
      success: false,
      message: 'An error occurred during user registration'
    };
  }
};

/**
 * Check if the current user has admin access
 * @returns Admin access status
 */
export const hasAdminAccess = (): boolean => {
  const user = getCurrentUser();
  return !!user && (user.role === 'admin' || user.role === 'master');
};

/**
 * Check if the current user has company admin access
 * @returns Company admin access status
 */
export const hasCompanyAdminAccess = (): boolean => {
  const user = getCurrentUser();
  return !!user && (user.isCompanyAdmin || user.role === 'admin' || user.role === 'master');
};

/**
 * Authentication service object
 */
export const AuthService = {
  initializeAuthService,
  login,
  logout,
  getCurrentUser,
  isUserAuthenticated,
  getAuthToken,
  registerUser,
  hasAdminAccess,
  hasCompanyAdminAccess
};

export default AuthService;