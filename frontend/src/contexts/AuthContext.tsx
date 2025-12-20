import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService, AuthResponse, UserProfile } from '@/lib/api';

interface User {
  id: string;
  email: string;
  // Auth fields (might be present from register)
  created_at?: string;
  updated_at?: string;
  // Profile fields (optional, because they don't exist immediately after register)
  username?: string;
  role?: string;
  experience?: string;
  time_commitment?: string;
  tech_tags?: string[];
  project_links?: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  // handleOAuthCallback: (accessToken: string, refreshToken: string, userInfo?: { id?: string; email?: string; name?: string }) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Check if user is already authenticated on app load
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Try to get user profile to validate token
      const response = await apiService.getUserProfile();
      if (response.profile) {
        setUser(response.profile);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Clear invalid token
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response: AuthResponse = await apiService.login({ email, password });

      // Store tokens
      localStorage.setItem('access_token', response.session.access_token);
      localStorage.setItem('refresh_token', response.session.refresh_token);

      // Set user
      setUser(response.user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response: AuthResponse = await apiService.register({ email, password });

      // Store tokens
      localStorage.setItem('access_token', response.session.access_token);
      localStorage.setItem('refresh_token', response.session.refresh_token);

      // Set user
      setUser(response.user);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // const handleOAuthCallback = async (accessToken: string, refreshToken: string, userInfo?: { id?: string; email?: string; name?: string }) => {
  //   try {
  //     setIsLoading(true);

  //     console.log('handleOAuthCallback called with userInfo:', userInfo);

  //     // Store tokens
  //     localStorage.setItem('access_token', accessToken);
  //     localStorage.setItem('refresh_token', refreshToken);

  //     // Try to fetch user profile
  //     try {
  //       const response = await apiService.getUserProfile();
  //       if (response.profile) {
  //         // If profile exists but doesn't have username, use OAuth info as fallback
  //         const profileUser: User = {
  //           ...response.profile,
  //           username: response.profile.username || userInfo?.name || userInfo?.email?.split('@')[0] || 'User',
  //         };
  //         console.log('Setting user from profile:', profileUser);
  //         setUser(profileUser);
  //       }
  //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //     } catch (profileError: any) {
  //       // If profile doesn't exist (new OAuth user), use Google account info for display
  //       console.log('Profile not found for OAuth user - using Google account info for display', userInfo);
  //       // Set user object with Google account info so the name shows correctly
  //       const userFromOAuth: User = {
  //         id: userInfo?.id || '',
  //         email: userInfo?.email || '',
  //         username: userInfo?.name || userInfo?.email?.split('@')[0] || 'User',
  //       };
  //       console.log('Setting user from OAuth:', userFromOAuth);
  //       setUser(userFromOAuth);
  //     }
  //   } catch (error) {
  //     console.error('OAuth callback handling failed:', error);
  //     // Clear tokens on error
  //     localStorage.removeItem('access_token');
  //     localStorage.removeItem('refresh_token');
  //     throw error;
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const logout = () => {
    // Clear tokens and user
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    // handleOAuthCallback,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
