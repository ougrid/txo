'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AuthContextType, User, LoginCredentials, RegisterCredentials, UpdateProfileData, ChangePasswordData } from '@/types/auth';
import { AuthService } from '@/services/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize authentication state
  const initializeAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const session = AuthService.getCurrentSession();
      if (session) {
        setUser(session.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Failed to initialize auth:', err);
      setError('Failed to initialize authentication');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Set up session refresh interval
  useEffect(() => {
    let refreshInterval: NodeJS.Timeout;

    if (isAuthenticated) {
      // Refresh session every 5 minutes if authenticated
      refreshInterval = setInterval(async () => {
        const success = await AuthService.refreshSession();
        if (!success) {
          // Session expired or refresh failed
          setUser(null);
          setIsAuthenticated(false);
          setError('Session expired. Please log in again.');
        }
      }, 5 * 60 * 1000); // 5 minutes
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [isAuthenticated]);

  // Listen for storage changes (multi-tab sync)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'miniseller_auth_session') {
        // Session changed in another tab
        initializeAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [initializeAuth]);

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await AuthService.login(credentials);
      
      if (result.success && result.session) {
        setUser(result.session.user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        const errorMessage = getErrorMessage(result.error || 'UNKNOWN_ERROR');
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch {
      const errorMessage = 'Login failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await AuthService.register(credentials);
      
      if (result.success && result.user) {
        // Auto-login after successful registration
        const loginResult = await AuthService.login({
          email: credentials.email,
          password: credentials.password,
          rememberMe: false
        });

        if (loginResult.success && loginResult.session) {
          setUser(loginResult.session.user);
          setIsAuthenticated(true);
          return { success: true };
        } else {
          return { success: true }; // Registration successful, but auto-login failed
        }
      } else {
        const errorMessage = getErrorMessage(result.error || 'UNKNOWN_ERROR');
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch {
      const errorMessage = 'Registration failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await AuthService.logout();
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: UpdateProfileData): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      setIsLoading(true);
      setError(null);

      const result = await AuthService.updateProfile(user.id, data);
      
      if (result.success && result.user) {
        setUser(result.user);
        return { success: true };
      } else {
        const errorMessage = getErrorMessage(result.error || 'UNKNOWN_ERROR');
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch {
      const errorMessage = 'Profile update failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (data: ChangePasswordData): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      if (data.newPassword !== data.confirmPassword) {
        return { success: false, error: 'New passwords do not match' };
      }

      setIsLoading(true);
      setError(null);

      const result = await AuthService.changePassword(user.id, data.currentPassword, data.newPassword);
      
      if (result.success) {
        return { success: true };
      } else {
        const errorMessage = getErrorMessage(result.error || 'UNKNOWN_ERROR');
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch {
      const errorMessage = 'Password change failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAccount = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      setIsLoading(true);
      setError(null);

      const result = await AuthService.deleteAccount(user.id);
      
      if (result.success) {
        setUser(null);
        setIsAuthenticated(false);
        return { success: true };
      } else {
        const errorMessage = getErrorMessage(result.error || 'UNKNOWN_ERROR');
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch {
      const errorMessage = 'Account deletion failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = (): void => {
    setError(null);
  };

  const refreshSession = async (): Promise<boolean> => {
    try {
      const success = await AuthService.refreshSession();
      if (!success) {
        setUser(null);
        setIsAuthenticated(false);
        setError('Session expired. Please log in again.');
      }
      return success;
    } catch (err) {
      console.error('Session refresh failed:', err);
      return false;
    }
  };

  const isSessionValid = (): boolean => {
    return AuthService.isSessionValid();
  };

  const getSessionInfo = (): { expiresAt: number; rememberMe: boolean } | null => {
    return AuthService.getSessionInfo();
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    clearError,
    refreshSession,
    deleteAccount,
    isSessionValid,
    getSessionInfo,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Helper function to convert error codes to user-friendly messages
function getErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'INVALID_CREDENTIALS':
      return 'Invalid email or password. Please check your credentials and try again.';
    case 'USER_EXISTS':
      return 'An account with this email already exists. Please use a different email or try logging in.';
    case 'USER_NOT_FOUND':
      return 'User account not found. Please check your email or create a new account.';
    case 'WEAK_PASSWORD':
      return 'Password must be at least 8 characters long and contain uppercase, lowercase, and numeric characters.';
    case 'INVALID_EMAIL':
      return 'Please enter a valid email address.';
    case 'SESSION_EXPIRED':
      return 'Your session has expired. Please log in again.';
    case 'UNAUTHORIZED':
      return 'You are not authorized to perform this action.';
    case 'NETWORK_ERROR':
      return 'Network error. Please check your connection and try again.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Convenience hooks
export function useUser() {
  const { user } = useAuth();
  return user;
}

export function useIsAuthenticated() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}

export function useAuthLoading() {
  const { isLoading } = useAuth();
  return isLoading;
}

export function useAuthError() {
  const { error, clearError } = useAuth();
  return { error, clearError };
}
