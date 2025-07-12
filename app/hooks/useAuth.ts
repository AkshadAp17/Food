import { createContext, useContext, useState, useEffect, createElement } from 'react';
import type { ReactNode } from 'react';
import { apiRequest } from '@/lib/queryClient';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  city?: string;
  pincode?: string;
  isVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<{ userId: string; email: string }>;
  verifyOTP: (email: string, otp: string) => Promise<void>;
  resendOTP: (email: string) => Promise<void>;
  logout: () => void;
}

interface RegisterData {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing user session
    const savedUser = localStorage.getItem('foodie_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('foodie_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const response = await apiRequest('POST', '/api/login', { email, password });
    const data = await response.json();
    
    const userData = data.user;
    setUser(userData);
    localStorage.setItem('foodie_user', JSON.stringify(userData));
  };

  const register = async (userData: RegisterData): Promise<{ userId: string; email: string }> => {
    const response = await apiRequest('POST', '/api/register', userData);
    const data = await response.json();
    return { userId: data.userId, email: data.email };
  };

  const verifyOTP = async (email: string, otp: string): Promise<void> => {
    const response = await apiRequest('POST', '/api/verify-otp', { email, otp });
    const data = await response.json();
    
    const userData = data.user;
    setUser(userData);
    localStorage.setItem('foodie_user', JSON.stringify(userData));
  };

  const resendOTP = async (email: string): Promise<void> => {
    await apiRequest('POST', '/api/resend-otp', { email });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('foodie_user');
  };

  const value = {
    user,
    isLoading,
    login,
    register,
    verifyOTP,
    resendOTP,
    logout,
  };

  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}