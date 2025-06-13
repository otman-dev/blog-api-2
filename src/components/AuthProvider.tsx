'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  // Initialize auth state from localStorage and validate token
  useEffect(() => {
    const validateStoredToken = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        try {
          // Validate the token with the server
          const response = await fetch('/api/validate-token', {
            headers: {
              'Authorization': `Bearer ${storedToken}`,
              'Content-Type': 'application/json'
            }
          });
          
          const data = await response.json();
          
          if (data.success && data.valid) {
            // Token is valid, use it
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
          } else {
            // Token is invalid, clear it
            console.log('🔒 Stored token is invalid, clearing...');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch (error) {
          // If validation fails, clear the token
          console.log('🔒 Token validation failed, clearing...');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      
      setLoading(false);
    };
    
    validateStoredToken();
  }, []);
  // Protection for authenticated routes
  useEffect(() => {
    if (!loading) {
      // Define public routes that don't require authentication
      const publicRoutes = ['/', '/login'];
      const isPublicRoute = publicRoutes.includes(pathname);
      
      // If not authenticated and not on a public route, redirect to login
      if (!token && !isPublicRoute) {
        router.push('/login');
      }
      
      // If authenticated and on login page, redirect to dashboard
      if (token && pathname === '/login') {
        router.push('/dashboard');
      }
    }
  }, [loading, token, pathname, router]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
