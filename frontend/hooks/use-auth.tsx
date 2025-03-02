import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthToken } from '@/lib/types';
import { authApi } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // On mount, check if we have a token in localStorage
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('auth_token');
      
      if (storedToken) {
        try {
          setToken(storedToken);
          const userData = await authApi.getCurrentUser(storedToken);
          setUser(userData);
        } catch (err) {
          console.error('Failed to authenticate with stored token', err);
          localStorage.removeItem('auth_token');
          setToken(null);
        }
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const data: AuthToken = await authApi.login(email, password);
      
      localStorage.setItem('auth_token', data.access_token);
      setToken(data.access_token);
      
      const userData = await authApi.getCurrentUser(data.access_token);
      setUser(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to login');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    try {
      setLoading(true);
      setError(null);
      
      await authApi.register(userData);
      
      // After registration, log the user in
      await login(userData.email, userData.password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}