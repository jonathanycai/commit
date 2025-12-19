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
  handleOAuthCallback: (accessToken: string, refreshToken: string) => Promise<void>;
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

  const handleOAuthCallback = async (accessToken: string, refreshToken: string) => {
    try {
      setIsLoading(true);
      
      // Store tokens
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);

      // Try to fetch user profile
      try {
        const response = await apiService.getUserProfile();
        if (response.profile) {
          setUser(response.profile);
        }
      } catch (profileError: any) {
        // If profile doesn't exist (new OAuth user), that's okay
        // They'll need to complete their profile, but we still have valid auth tokens
        console.log('Profile not found for OAuth user - they will need to complete profile setup');
        // Set a minimal user object so the user is considered authenticated
        // The app can check if profile is complete and redirect to profile setup if needed
        const minimalUser: User = {
          id: '', // Will be populated when profile is created
          email: '', // Will be populated when profile is created
        };
        setUser(minimalUser);
      }
    } catch (error) {
      console.error('OAuth callback handling failed:', error);
      // Clear tokens on error
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

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
    handleOAuthCallback,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
