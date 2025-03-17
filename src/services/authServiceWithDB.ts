import { User, LoginCredentials } from '@/types/users';
import { toast } from 'sonner';
import { 
  getUsers, 
  getUserByCredentials, 
  updateUserLastLogin 
} from './user/supabaseUserService';

// Initialize the authenticated user state
let currentUser: User | null = null;
let isAuthenticated = false;

// Initialize the auth service
export const initializeAuthService = async () => {
  try {
    // Try to get the user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      currentUser = JSON.parse(storedUser);
      isAuthenticated = true;
    }
    
    console.log('Auth service initialized');
  } catch (error) {
    console.error('Error initializing auth service:', error);
  }
};

export const login = async (
  credentials: LoginCredentials
): Promise<{ success: boolean; user?: User; message: string }> => {
  console.log('Login attempt with:', credentials);

  try {
    const user = await getUserByCredentials(credentials.email, credentials.password);

    if (user) {
      // Update user's last login time
      await updateUserLastLogin(user.id);
      
      // Update local state
      currentUser = user;
      isAuthenticated = true;
      localStorage.setItem('user', JSON.stringify(currentUser));

      return {
        success: true,
        user: { ...user, password: '****' }, // Don't send password back to client
        message: 'Login successful'
      };
    } else {
      return {
        success: false,
        message: 'Invalid email or password'
      };
    }
  } catch (error) {
    console.error('Error during login:', error);
    return {
      success: false,
      message: 'An error occurred during login'
    };
  }
};

export const logout = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    currentUser = null;
    isAuthenticated = false;
    localStorage.removeItem('user');

    return {
      success: true,
      message: 'Logout successful'
    };
  } catch (error) {
    console.error('Error during logout:', error);
    return {
      success: false,
      message: 'An error occurred during logout'
    };
  }
};

export const getCurrentUser = (): User | null => {
  return currentUser;
};

export const isUserAuthenticated = (): boolean => {
  return isAuthenticated;
};

// This function will be used as a fallback if the database is not available
export const useMockAuthentication = () => {
  // Import the mock auth service
  const mockAuthService = require('./authService');
  
  // Use the mock auth service directly
  // We can't reassign the exported functions, so we'll need to use the mock service directly
  // This is just a placeholder to show how we might handle fallback to mock authentication
  
  // Initialize the mock auth service
  mockAuthService.initializeAuthService();
  
  console.log('Using mock authentication');
  
  // Return the mock functions so they can be used
  return {
    login: mockAuthService.login,
    logout: mockAuthService.logout,
    getCurrentUser: mockAuthService.getCurrentUser,
    isUserAuthenticated: mockAuthService.isUserAuthenticated
  };
};