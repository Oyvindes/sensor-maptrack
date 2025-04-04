/**
 * Tests for the refactored authentication service
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AuthService } from './authServiceRefactored';
import { supabase } from '@/integrations/supabase/client';
import { ErrorService } from '@/services/error/errorService';

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn()
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn()
            }))
          }))
        })),
        single: vi.fn()
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn()
          }))
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn()
        }))
      }))
    }))
  }
}));

vi.mock('@/services/error/errorService', () => ({
  ErrorService: {
    handleError: vi.fn(),
    createAuthError: vi.fn(() => ({ type: 'auth_error' })),
    createDatabaseError: vi.fn(() => ({ type: 'db_error' }))
  }
}));

// Mock sessionStorage
const mockSessionStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage
});

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSessionStorage.clear();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('initializeAuthService', () => {
    it('should restore user session from storage if valid token exists', async () => {
      // Arrange
      const mockUser = { id: 'user-123', name: 'Test User' };
      mockSessionStorage.setItem('auth_token', 'valid-token');
      mockSessionStorage.setItem('auth_user', JSON.stringify(mockUser));
      
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null
      } as any);

      // Act
      await AuthService.initializeAuthService();

      // Assert
      expect(supabase.auth.getUser).toHaveBeenCalledWith('valid-token');
      expect(AuthService.getCurrentUser()).toEqual(mockUser);
      expect(AuthService.isUserAuthenticated()).toBe(true);
    });

    it('should clear storage if token is invalid', async () => {
      // Arrange
      mockSessionStorage.setItem('auth_token', 'invalid-token');
      mockSessionStorage.setItem('auth_user', JSON.stringify({ id: 'user-123' }));
      
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' } as any
      } as any);

      // Act
      await AuthService.initializeAuthService();

      // Assert
      expect(supabase.auth.getUser).toHaveBeenCalledWith('invalid-token');
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('auth_token');
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('auth_user');
      expect(AuthService.getCurrentUser()).toBeNull();
      expect(AuthService.isUserAuthenticated()).toBe(false);
    });
  });

  describe('login', () => {
    it('should login successfully with Supabase auth', async () => {
      // Arrange
      const credentials = { email: 'test@example.com', password: 'password123' };
      const mockUser = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        company_id: 'company-123',
        last_login: '2025-04-04T12:00:00Z',
        status: 'active',
        is_company_admin: false
      };
      
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: {
          session: {
            access_token: 'new-token'
          }
        },
        error: null
      } as any);
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockUser,
              error: null
            })
          })
        })
      } as any);

      // Act
      const result = await AuthService.login(credentials);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Login successful');
      expect(result.user).toBeDefined();
      expect(result.user?.email).toBe('test@example.com');
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('auth_token', 'new-token');
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('auth_user', expect.any(String));
      expect(AuthService.isUserAuthenticated()).toBe(true);
    });

    it('should fall back to legacy login if Supabase auth fails', async () => {
      // Arrange
      const credentials = { email: 'test@example.com', password: 'password123' };
      const mockUser = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        company_id: 'company-123',
        last_login: '2025-04-04T12:00:00Z',
        status: 'active',
        is_company_admin: false
      };
      
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { session: null },
        error: { message: 'Invalid credentials' } as any
      } as any);
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: mockUser,
                  error: null
                })
              })
            })
          })
        })
      } as any);

      // Act
      const result = await AuthService.login(credentials);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Login successful (legacy mode)');
      expect(result.user).toBeDefined();
      expect(result.user?.email).toBe('test@example.com');
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('auth_token', expect.stringContaining('legacy_'));
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('auth_user', expect.any(String));
      expect(AuthService.isUserAuthenticated()).toBe(true);
    });

    it('should handle login failure', async () => {
      // Arrange
      const credentials = { email: 'test@example.com', password: 'wrong-password' };
      
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { session: null },
        error: { message: 'Invalid credentials' } as any
      } as any);
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: null,
                  error: null
                })
              })
            })
          })
        })
      } as any);

      // Act
      const result = await AuthService.login(credentials);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid email or password');
      expect(result.user).toBeUndefined();
      expect(AuthService.isUserAuthenticated()).toBe(false);
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      // Arrange
      mockSessionStorage.setItem('auth_token', 'valid-token');
      mockSessionStorage.setItem('auth_user', JSON.stringify({ id: 'user-123' }));
      
      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: null
      } as any);

      // Act
      const result = await AuthService.logout();

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Logout successful');
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('auth_token');
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('auth_user');
      expect(AuthService.isUserAuthenticated()).toBe(false);
      expect(AuthService.getCurrentUser()).toBeNull();
    });

    it('should handle logout errors', async () => {
      // Arrange
      mockSessionStorage.setItem('auth_token', 'valid-token');
      mockSessionStorage.setItem('auth_user', JSON.stringify({ id: 'user-123' }));
      
      vi.mocked(supabase.auth.signOut).mockRejectedValue(new Error('Network error'));

      // Act
      const result = await AuthService.logout();

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('An error occurred during logout');
      expect(ErrorService.handleError).toHaveBeenCalled();
    });
  });

  describe('hasAdminAccess', () => {
    it('should return true for admin users', () => {
      // Arrange
      const adminUser = {
        id: 'user-123',
        name: 'Admin User',
        email: 'admin@example.com',
        password: '********',
        role: 'admin',
        companyId: 'company-123',
        lastLogin: '2025-04-04T12:00:00Z',
        status: 'active',
        isCompanyAdmin: true
      };
      
      mockSessionStorage.setItem('auth_token', 'valid-token');
      mockSessionStorage.setItem('auth_user', JSON.stringify(adminUser));
      
      // Manually set the current user for testing
      (AuthService as any).authState = {
        currentUser: adminUser,
        isAuthenticated: true,
        authToken: 'valid-token'
      };

      // Act & Assert
      expect(AuthService.hasAdminAccess()).toBe(true);
    });

    it('should return false for non-admin users', () => {
      // Arrange
      const regularUser = {
        id: 'user-123',
        name: 'Regular User',
        email: 'user@example.com',
        password: '********',
        role: 'user',
        companyId: 'company-123',
        lastLogin: '2025-04-04T12:00:00Z',
        status: 'active',
        isCompanyAdmin: false
      };
      
      mockSessionStorage.setItem('auth_token', 'valid-token');
      mockSessionStorage.setItem('auth_user', JSON.stringify(regularUser));
      
      // Manually set the current user for testing
      (AuthService as any).authState = {
        currentUser: regularUser,
        isAuthenticated: true,
        authToken: 'valid-token'
      };

      // Act & Assert
      expect(AuthService.hasAdminAccess()).toBe(false);
    });
  });
});